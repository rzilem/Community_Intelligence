
import { supabase } from '@/integrations/supabase/client';
import JSZip from 'jszip';
import { devLog } from '@/utils/dev-logger';

export interface ProcessingProgress {
  stage: 'analyzing' | 'creating_properties' | 'uploading' | 'complete' | 'error';
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
  associationName: string;
  associationId: string;
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
  warnings: string[];
  errors: string[];
  processingTime: number;
}

interface UnitFolder {
  unitName: string;
  files: Array<{
    name: string;
    content: ArrayBuffer;
    path: string;
  }>;
}

interface AssociationStructure {
  associationName: string;
  units: UnitFolder[];
  generalFiles: Array<{
    name: string;
    content: ArrayBuffer;
    path: string;
  }>;
}

class DocumentStorageProcessor {
  private progressCallback?: (progress: ProcessingProgress) => void;
  private isCancelled = false;
  private processingStartTime = 0;

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback;
  }

  cancel() {
    this.isCancelled = true;
    devLog.info('Document storage processing cancelled');
  }

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    this.processingStartTime = Date.now();
    this.isCancelled = false;

    try {
      devLog.info('Starting hierarchical ZIP processing:', {
        fileName: zipFile.name,
        fileSize: zipFile.size
      });

      // Step 1: Analyze ZIP structure
      this.updateProgress({
        stage: 'analyzing',
        message: 'Analyzing ZIP file structure...',
        progress: 5,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      });

      const zipStructure = await this.analyzeZipStructure(zipFile);
      
      if (this.isCancelled) {
        throw new Error('Processing was cancelled');
      }

      devLog.info('ZIP structure analyzed:', {
        associationName: zipStructure.associationName,
        unitsFound: zipStructure.units.length,
        generalFiles: zipStructure.generalFiles.length
      });

      // Step 2: Create or find association and properties
      this.updateProgress({
        stage: 'creating_properties',
        message: `Creating association "${zipStructure.associationName}" and properties...`,
        progress: 15,
        filesProcessed: 0,
        totalFiles: zipStructure.units.reduce((sum, unit) => sum + unit.files.length, 0) + zipStructure.generalFiles.length,
        unitsProcessed: 0,
        totalUnits: zipStructure.units.length
      });

      const { associationId, createdProperties } = await this.createAssociationAndProperties(zipStructure);

      if (this.isCancelled) {
        throw new Error('Processing was cancelled');
      }

      // Step 3: Process and upload documents
      this.updateProgress({
        stage: 'uploading',
        message: 'Processing and uploading documents...',
        progress: 25,
        filesProcessed: 0,
        totalFiles: zipStructure.units.reduce((sum, unit) => sum + unit.files.length, 0) + zipStructure.generalFiles.length,
        unitsProcessed: 0,
        totalUnits: zipStructure.units.length
      });

      const uploadResults = await this.uploadDocuments(zipStructure, associationId, createdProperties);

      if (this.isCancelled) {
        throw new Error('Processing was cancelled');
      }

      const processingTime = Date.now() - this.processingStartTime;

      const finalResult: DocumentStorageResult = {
        success: uploadResults.errors.length === 0,
        associationName: zipStructure.associationName,
        associationId,
        documentsImported: uploadResults.documentsImported,
        documentsSkipped: uploadResults.documentsSkipped,
        totalFiles: zipStructure.units.reduce((sum, unit) => sum + unit.files.length, 0) + zipStructure.generalFiles.length,
        createdProperties,
        createdOwners: [], // Will be implemented when owner parsing is added
        warnings: uploadResults.warnings,
        errors: uploadResults.errors,
        processingTime
      };

      this.updateProgress({
        stage: 'complete',
        message: `Import completed! ${uploadResults.documentsImported} documents imported successfully.`,
        progress: 100,
        filesProcessed: uploadResults.documentsImported + uploadResults.documentsSkipped,
        totalFiles: finalResult.totalFiles,
        unitsProcessed: zipStructure.units.length,
        totalUnits: zipStructure.units.length
      });

      devLog.info('Document storage processing completed:', finalResult);
      return finalResult;

    } catch (error) {
      devLog.error('Document storage processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      const failedResult: DocumentStorageResult = {
        success: false,
        associationName: 'Unknown',
        associationId: '',
        documentsImported: 0,
        documentsSkipped: 0,
        totalFiles: 0,
        createdProperties: [],
        createdOwners: [],
        warnings: [],
        errors: [errorMessage],
        processingTime: Date.now() - this.processingStartTime
      };

      return failedResult;
    }
  }

  private async analyzeZipStructure(zipFile: File): Promise<AssociationStructure> {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipFile);

    let associationName = 'Unknown Association';
    const units: UnitFolder[] = [];
    const generalFiles: Array<{ name: string; content: ArrayBuffer; path: string }> = [];

    // Find the root association folder
    const entries = Object.keys(zipContent.files);
    const rootFolders = entries
      .filter(path => path.includes('/') && !path.startsWith('__MACOSX'))
      .map(path => path.split('/')[0])
      .filter((folder, index, arr) => arr.indexOf(folder) === index);

    if (rootFolders.length > 0) {
      associationName = rootFolders[0];
    }

    // Process all files
    for (const [path, zipEntry] of Object.entries(zipContent.files)) {
      if (zipEntry.dir || path.startsWith('__MACOSX') || path.startsWith('.')) {
        continue;
      }

      const pathParts = path.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      // Skip system files and empty files
      if (fileName.startsWith('.') || fileName.startsWith('~') || !fileName.includes('.')) {
        continue;
      }

      try {
        const content = await zipEntry.async('arraybuffer');
        
        // Determine if this is a unit-specific file or general file
        if (pathParts.length >= 3) {
          // This is likely a unit file: Association/Unit/file.pdf
          const unitName = pathParts[1];
          
          let unitFolder = units.find(u => u.unitName === unitName);
          if (!unitFolder) {
            unitFolder = { unitName, files: [] };
            units.push(unitFolder);
          }
          
          unitFolder.files.push({
            name: fileName,
            content,
            path
          });
        } else if (pathParts.length === 2) {
          // This is a general association file: Association/file.pdf
          generalFiles.push({
            name: fileName,
            content,
            path
          });
        }
      } catch (error) {
        devLog.warn(`Failed to process file ${path}:`, error);
      }
    }

    return {
      associationName,
      units,
      generalFiles
    };
  }

  private async createAssociationAndProperties(structure: AssociationStructure) {
    // Create or find association
    let { data: existingAssociation } = await supabase
      .from('associations')
      .select('id')
      .eq('name', structure.associationName)
      .single();

    let associationId: string;

    if (existingAssociation) {
      associationId = existingAssociation.id;
      devLog.info('Using existing association:', associationId);
    } else {
      const { data: newAssociation, error } = await supabase
        .from('associations')
        .insert({
          name: structure.associationName,
          address: `${structure.associationName} Address`,
          city: 'Unknown',
          state: 'Unknown',
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create association: ${error.message}`);
      }

      associationId = newAssociation.id;
      devLog.info('Created new association:', associationId);
    }

    // Create properties for each unit
    const createdProperties = [];
    
    for (const unit of structure.units) {
      // Check if property already exists
      const { data: existingProperty } = await supabase
        .from('properties')
        .select('id, address, unit_number')
        .eq('association_id', associationId)
        .eq('unit_number', unit.unitName)
        .single();

      if (existingProperty) {
        createdProperties.push({
          id: existingProperty.id,
          address: existingProperty.address,
          unitNumber: existingProperty.unit_number || unit.unitName
        });
        devLog.info('Using existing property:', existingProperty.id);
      } else {
        const { data: newProperty, error } = await supabase
          .from('properties')
          .insert({
            association_id: associationId,
            address: `${structure.associationName} ${unit.unitName}`,
            unit_number: unit.unitName,
            property_type: 'condo',
            city: 'Unknown',
            state: 'Unknown'
          })
          .select()
          .single();

        if (error) {
          devLog.error(`Failed to create property for unit ${unit.unitName}:`, error);
          continue;
        }

        createdProperties.push({
          id: newProperty.id,
          address: newProperty.address,
          unitNumber: newProperty.unit_number || unit.unitName
        });
        devLog.info('Created new property:', newProperty.id);
      }
    }

    return { associationId, createdProperties };
  }

  private async uploadDocuments(
    structure: AssociationStructure,
    associationId: string,
    properties: Array<{ id: string; address: string; unitNumber: string }>
  ) {
    let documentsImported = 0;
    let documentsSkipped = 0;
    const warnings: string[] = [];
    const errors: string[] = [];
    let filesProcessed = 0;

    const totalFiles = structure.units.reduce((sum, unit) => sum + unit.files.length, 0) + structure.generalFiles.length;

    // Process unit-specific documents
    for (const unit of structure.units) {
      const property = properties.find(p => p.unitNumber === unit.unitName);
      
      if (!property) {
        warnings.push(`No property found for unit ${unit.unitName}, skipping ${unit.files.length} files`);
        documentsSkipped += unit.files.length;
        continue;
      }

      for (const file of unit.files) {
        if (this.isCancelled) {
          throw new Error('Processing was cancelled');
        }

        try {
          const result = await this.uploadSingleDocument(
            file,
            associationId,
            property.id,
            null, // owner_id
            this.categorizeDocument(file.name, file.path),
            file.path
          );

          if (result) {
            documentsImported++;
            devLog.info(`Uploaded document for unit ${unit.unitName}:`, file.name);
          } else {
            documentsSkipped++;
            warnings.push(`Skipped ${file.name} in unit ${unit.unitName} (file too large or invalid type)`);
          }
        } catch (error) {
          documentsSkipped++;
          const errorMsg = `Failed to upload ${file.name} in unit ${unit.unitName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          devLog.error(errorMsg, error);
        }

        filesProcessed++;
        this.updateProgress({
          stage: 'uploading',
          message: `Processing documents... (${filesProcessed}/${totalFiles})`,
          progress: 25 + (filesProcessed / totalFiles) * 70,
          filesProcessed,
          totalFiles,
          unitsProcessed: Math.floor(filesProcessed / (totalFiles / structure.units.length)),
          totalUnits: structure.units.length
        });
      }
    }

    // Process general association documents
    for (const file of structure.generalFiles) {
      if (this.isCancelled) {
        throw new Error('Processing was cancelled');
      }

      try {
        const result = await this.uploadSingleDocument(
          file,
          associationId,
          null, // property_id
          null, // owner_id
          this.categorizeDocument(file.name, file.path),
          file.path
        );

        if (result) {
          documentsImported++;
          devLog.info('Uploaded general document:', file.name);
        } else {
          documentsSkipped++;
          warnings.push(`Skipped general document ${file.name} (file too large or invalid type)`);
        }
      } catch (error) {
        documentsSkipped++;
        const errorMsg = `Failed to upload general document ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        devLog.error(errorMsg, error);
      }

      filesProcessed++;
      this.updateProgress({
        stage: 'uploading',
        message: `Processing documents... (${filesProcessed}/${totalFiles})`,
        progress: 25 + (filesProcessed / totalFiles) * 70,
        filesProcessed,
        totalFiles,
        unitsProcessed: structure.units.length,
        totalUnits: structure.units.length
      });
    }

    return {
      documentsImported,
      documentsSkipped,
      warnings,
      errors
    };
  }

  private async uploadSingleDocument(
    file: { name: string; content: ArrayBuffer; path: string },
    associationId: string,
    propertyId: string | null,
    ownerId: string | null,
    documentType: string,
    folderPath: string
  ): Promise<boolean> {
    // Check file size (300MB limit)
    if (file.content.byteLength > 314572800) {
      return false;
    }

    // Create unique file path
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${associationId}/${propertyId || 'general'}/${timestamp}_${cleanFileName}`;

    // Upload to storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file.content, {
        contentType: this.getMimeType(file.name),
        upsert: false
      });

    if (storageError) {
      throw new Error(`Storage upload failed: ${storageError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(storagePath);

    // Create document record
    const { error: docError } = await supabase
      .from('documents')
      .insert({
        association_id: associationId,
        property_id: propertyId,
        owner_id: ownerId,
        name: file.name,
        url: urlData.publicUrl,
        file_type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        file_size: file.content.byteLength,
        document_type: documentType,
        folder_path: folderPath,
        category: documentType,
        is_public: false,
        is_archived: false
      });

    if (docError) {
      // Clean up storage if database insert fails
      await supabase.storage.from('documents').remove([storagePath]);
      throw new Error(`Database insert failed: ${docError.message}`);
    }

    return true;
  }

  private categorizeDocument(fileName: string, filePath: string): string {
    const name = fileName.toLowerCase();
    const path = filePath.toLowerCase();

    if (name.includes('lease') || name.includes('rental')) return 'lease';
    if (name.includes('insurance') || name.includes('policy')) return 'insurance';
    if (name.includes('maintenance') || name.includes('repair')) return 'maintenance';
    if (name.includes('invoice') || name.includes('bill')) return 'invoice';
    if (name.includes('contract') || name.includes('agreement')) return 'contract';
    if (name.includes('inspection') || name.includes('report')) return 'inspection';
    if (name.includes('permit') || name.includes('license')) return 'permit';
    if (name.includes('tax') || name.includes('assessment')) return 'tax';
    if (name.includes('hoa') || name.includes('condo') || name.includes('bylaw')) return 'governance';
    if (name.includes('financial') || name.includes('budget')) return 'financial';
    
    return 'general';
  }

  private getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      txt: 'text/plain',
      csv: 'text/csv'
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  private updateProgress(progress: ProcessingProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  async resumeProcessing(zipFile: File): Promise<DocumentStorageResult> {
    // For now, just restart the processing
    // In a future version, we could implement actual resume functionality
    return this.processHierarchicalZip(zipFile);
  }
}

export const documentStorageProcessor = new DocumentStorageProcessor();
