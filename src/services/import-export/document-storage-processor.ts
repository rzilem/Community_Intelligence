
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface ProcessingProgress {
  stage: 'analyzing' | 'processing' | 'uploading' | 'creating_properties' | 'complete' | 'error';
  message: string;
  progress: number;
  filesProcessed: number;
  totalFiles: number;
  unitsProcessed: number;
  totalUnits: number;
  canResume?: boolean;
}

export interface DocumentStorageResult {
  success: boolean;
  documentsImported: number;
  documentsSkipped: number;
  totalFiles: number;
  createdProperties: Array<{
    id: string;
    address: string;
    unitNumber: string;
  }>;
  createdOwners: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
  }>;
  associationName: string;
  processingTime: number;
  warnings: string[];
  errors: string[];
}

class DocumentStorageProcessor {
  private progressCallback?: (progress: ProcessingProgress) => void;
  private isCancelled = false;

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback;
  }

  cancel() {
    this.isCancelled = true;
    devLog.info('Document processing cancelled');
  }

  private updateProgress(progress: ProcessingProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  private extractUnitFromFolderName(folderName: string): { unitNumber: string | null; address: string | null; isAdminFolder: boolean } {
    devLog.info('Extracting unit from folder:', folderName);
    
    // Check if it's an administrative folder
    const adminFolders = [
      'arc requests', 'collections', 'board', 'financial', 'legal', 
      'maintenance', 'insurance', 'contracts', 'correspondence', 
      'meeting minutes', 'bylaws', 'rules', 'regulations'
    ];
    
    if (adminFolders.some(admin => folderName.toLowerCase().includes(admin))) {
      devLog.info('Identified as administrative folder:', folderName);
      return { unitNumber: null, address: null, isAdminFolder: true };
    }

    // Enhanced pattern for GOC format: GOC[number]-[address] Unit [number]
    const gocPattern = /GOC\d+-(.+?)\s+Unit\s+(\d+[A-Za-z]?)/i;
    const gocMatch = folderName.match(gocPattern);
    
    if (gocMatch) {
      const address = gocMatch[1].trim();
      const unitNumber = gocMatch[2];
      devLog.info('GOC pattern matched:', { address, unitNumber });
      return { unitNumber, address, isAdminFolder: false };
    }

    // Standard unit patterns
    const unitPatterns = [
      /Unit\s+(\d+[A-Za-z]?)/i,
      /Apt\s+(\d+[A-Za-z]?)/i,
      /Suite\s+(\d+[A-Za-z]?)/i,
      /^(\d+[A-Za-z]?)$/,
      /#(\d+[A-Za-z]?)/
    ];

    for (const pattern of unitPatterns) {
      const match = folderName.match(pattern);
      if (match) {
        const unitNumber = match[1];
        devLog.info('Unit pattern matched:', { unitNumber, pattern: pattern.source });
        return { unitNumber, address: null, isAdminFolder: false };
      }
    }

    devLog.warn('No unit pattern matched for folder:', folderName);
    return { unitNumber: null, address: null, isAdminFolder: false };
  }

  private async extractAssociationName(zip: JSZip): Promise<string> {
    // Try to extract association name from folder structure or files
    const rootFolders = Object.keys(zip.files)
      .filter(path => !zip.files[path].dir && path.includes('/'))
      .map(path => path.split('/')[0])
      .filter((folder, index, arr) => arr.indexOf(folder) === index);

    // Look for common patterns in folder names
    for (const folder of rootFolders) {
      if (folder.toLowerCase().includes('hoa') || 
          folder.toLowerCase().includes('association') ||
          folder.toLowerCase().includes('community')) {
        return folder;
      }
    }

    // Extract from GOC pattern if available
    const gocFolder = rootFolders.find(folder => folder.match(/GOC\d+-(.+?)\s+Unit/i));
    if (gocFolder) {
      const match = gocFolder.match(/GOC\d+-(.+?)\s+Unit/i);
      if (match) {
        return match[1].trim() + ' Community';
      }
    }

    return 'Imported Community';
  }

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    const startTime = Date.now();
    const result: DocumentStorageResult = {
      success: false,
      documentsImported: 0,
      documentsSkipped: 0,
      totalFiles: 0,
      createdProperties: [],
      createdOwners: [],
      associationName: '',
      processingTime: 0,
      warnings: [],
      errors: []
    };

    try {
      devLog.info('Starting hierarchical ZIP processing');
      
      this.updateProgress({
        stage: 'analyzing',
        message: 'Loading ZIP file...',
        progress: 10,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      });

      const zip = await JSZip.loadAsync(zipFile);
      
      // Extract association name
      result.associationName = await this.extractAssociationName(zip);
      devLog.info('Association name:', result.associationName);

      // Create or get association
      const { data: association, error: assocError } = await supabase
        .from('associations')
        .select('id')
        .eq('name', result.associationName)
        .maybeSingle();

      let associationId: string;
      
      if (association) {
        associationId = association.id;
        devLog.info('Using existing association:', associationId);
      } else {
        const { data: newAssoc, error: createError } = await supabase
          .from('associations')
          .insert({
            name: result.associationName,
            status: 'active'
          })
          .select('id')
          .single();

        if (createError || !newAssoc) {
          throw new Error(`Failed to create association: ${createError?.message}`);
        }
        
        associationId = newAssoc.id;
        devLog.info('Created new association:', associationId);
      }

      this.updateProgress({
        stage: 'analyzing',
        message: 'Analyzing folder structure...',
        progress: 20,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      });

      // Analyze folder structure
      const folderStructure = new Map<string, { files: JSZip.JSZipObject[], unitInfo: any }>();
      const allFiles = Object.values(zip.files).filter(file => !file.dir);
      result.totalFiles = allFiles.length;

      // Group files by their parent folder
      for (const file of allFiles) {
        const pathParts = file.name.split('/');
        if (pathParts.length < 2) continue;

        const folderName = pathParts[0];
        if (!folderStructure.has(folderName)) {
          const unitInfo = this.extractUnitFromFolderName(folderName);
          folderStructure.set(folderName, { files: [], unitInfo });
        }
        folderStructure.get(folderName)!.files.push(file);
      }

      devLog.info('Folder structure analyzed:', {
        totalFolders: folderStructure.size,
        totalFiles: result.totalFiles
      });

      this.updateProgress({
        stage: 'creating_properties',
        message: 'Creating properties and processing documents...',
        progress: 30,
        filesProcessed: 0,
        totalFiles: result.totalFiles,
        unitsProcessed: 0,
        totalUnits: folderStructure.size
      });

      let filesProcessed = 0;
      let unitsProcessed = 0;

      // Process each folder
      for (const [folderName, { files, unitInfo }] of folderStructure) {
        if (this.isCancelled) {
          throw new Error('Processing cancelled by user');
        }

        devLog.info('Processing folder:', folderName, { unitInfo, fileCount: files.length });

        let propertyId: string | null = null;

        // Create property if this is a unit folder
        if (!unitInfo.isAdminFolder && unitInfo.unitNumber) {
          const address = unitInfo.address || 'Unknown Address';
          
          // Check if property already exists
          const { data: existingProperty } = await supabase
            .from('properties')
            .select('id')
            .eq('association_id', associationId)
            .eq('unit_number', unitInfo.unitNumber)
            .maybeSingle();

          if (existingProperty) {
            propertyId = existingProperty.id;
            devLog.info('Using existing property:', propertyId);
          } else {
            const { data: newProperty, error: propertyError } = await supabase
              .from('properties')
              .insert({
                association_id: associationId,
                unit_number: unitInfo.unitNumber,
                address: address,
                property_type: 'unit',
                status: 'active'
              })
              .select('id, address, unit_number')
              .single();

            if (propertyError) {
              devLog.error('Failed to create property:', propertyError);
              result.errors.push(`Failed to create property for ${folderName}: ${propertyError.message}`);
            } else if (newProperty) {
              propertyId = newProperty.id;
              result.createdProperties.push({
                id: newProperty.id,
                address: newProperty.address,
                unitNumber: newProperty.unit_number
              });
              devLog.info('Created new property:', newProperty);
            }
          }
        }

        // Process files in the folder
        for (const file of files) {
          if (this.isCancelled) break;

          try {
            const fileBuffer = await file.async('uint8array');
            const fileName = file.name.split('/').pop() || 'unknown';
            const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
            
            // Skip system files
            if (fileName.startsWith('.') || fileName.startsWith('__MACOSX')) {
              result.documentsSkipped++;
              filesProcessed++;
              continue;
            }

            // Determine file type and category
            const fileType = this.getFileType(fileExtension);
            const category = unitInfo.isAdminFolder ? folderName : 'Unit Documents';

            // Create document URL (in real implementation, you'd upload to storage)
            const documentUrl = `documents/${associationId}/${fileName}`;

            // Insert document record
            const { error: docError } = await supabase
              .from('documents')
              .insert({
                association_id: associationId,
                name: fileName,
                url: documentUrl,
                file_type: fileType,
                file_size: fileBuffer.byteLength,
                category: category,
                description: `Imported from ${folderName}`,
                is_public: false,
                uploaded_by: null
              });

            if (docError) {
              devLog.error('Failed to create document:', docError);
              result.errors.push(`Failed to import ${fileName}: ${docError.message}`);
              result.documentsSkipped++;
            } else {
              result.documentsImported++;
              devLog.info('Document imported:', fileName);
            }

          } catch (error) {
            devLog.error('Error processing file:', file.name, error);
            result.errors.push(`Error processing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            result.documentsSkipped++;
          }

          filesProcessed++;
          
          this.updateProgress({
            stage: 'processing',
            message: `Processing ${folderName}... (${filesProcessed}/${result.totalFiles})`,
            progress: 30 + (filesProcessed / result.totalFiles) * 60,
            filesProcessed,
            totalFiles: result.totalFiles,
            unitsProcessed,
            totalUnits: folderStructure.size
          });
        }

        unitsProcessed++;
      }

      this.updateProgress({
        stage: 'complete',
        message: 'Import completed successfully!',
        progress: 100,
        filesProcessed: result.totalFiles,
        totalFiles: result.totalFiles,
        unitsProcessed: folderStructure.size,
        totalUnits: folderStructure.size
      });

      result.success = true;
      result.processingTime = Date.now() - startTime;

      devLog.info('Document import completed:', {
        documentsImported: result.documentsImported,
        documentsSkipped: result.documentsSkipped,
        propertiesCreated: result.createdProperties.length,
        processingTime: result.processingTime
      });

    } catch (error) {
      devLog.error('Document import failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error occurred');
      result.processingTime = Date.now() - startTime;
      
      this.updateProgress({
        stage: 'error',
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0,
        canResume: true
      });
    }

    return result;
  }

  async resumeProcessing(zipFile: File): Promise<DocumentStorageResult> {
    // For now, just restart the process
    // In a full implementation, you'd restore from saved state
    devLog.info('Resuming document processing (restarting)');
    return this.processHierarchicalZip(zipFile);
  }

  private getFileType(extension: string): string {
    const typeMap: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      txt: 'text/plain',
      csv: 'text/csv'
    };
    
    return typeMap[extension] || 'application/octet-stream';
  }
}

export const documentStorageProcessor = new DocumentStorageProcessor();
