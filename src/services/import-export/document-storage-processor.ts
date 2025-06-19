
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
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
  associationId: string;
  associationName: string;
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
  errors: string[];
  warnings: string[];
  processingTime: number;
}

class DocumentStorageProcessor {
  private progressCallback?: (progress: ProcessingProgress) => void;
  private cancelled = false;
  private supportedFileTypes = [
    'pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'
  ];
  private maxFileSize = 10 * 1024 * 1024; // 10MB

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback;
  }

  cancel() {
    this.cancelled = true;
  }

  private updateProgress(stage: ProcessingProgress['stage'], message: string, progress: number, 
                        filesProcessed = 0, totalFiles = 0, unitsProcessed = 0, totalUnits = 0) {
    if (this.progressCallback) {
      this.progressCallback({
        stage,
        message,
        progress,
        filesProcessed,
        totalFiles,
        unitsProcessed,
        totalUnits,
        canResume: stage === 'error'
      });
    }
  }

  async processHierarchicalZip(file: File): Promise<DocumentStorageResult> {
    const startTime = Date.now();
    
    try {
      this.cancelled = false;
      this.updateProgress('analyzing', 'Loading ZIP file...', 0);

      const zip = await JSZip.loadAsync(file);
      const structure = await this.analyzeZipStructure(zip);

      if (!structure.associationFolder) {
        throw new Error('ZIP file must contain a single top-level folder representing the association');
      }

      this.updateProgress('creating_properties', 'Creating association and properties...', 10);
      
      // Create or get association
      const associationId = await this.createOrGetAssociation(structure.associationFolder);
      
      // Create properties for each unit folder
      const createdProperties = await this.createPropertiesFromStructure(associationId, structure);
      
      this.updateProgress('uploading', 'Processing and uploading documents...', 30);
      
      // Upload documents
      const uploadResult = await this.uploadDocumentsFromZip(zip, associationId, structure, createdProperties);

      const result: DocumentStorageResult = {
        success: true,
        associationId,
        associationName: structure.associationFolder,
        documentsImported: uploadResult.documentsImported,
        documentsSkipped: uploadResult.documentsSkipped,
        totalFiles: uploadResult.totalFiles,
        createdProperties: createdProperties.map(p => ({
          id: p.id,
          address: p.address || 'Unknown Address',
          unitNumber: p.unit_number || 'Unknown Unit'
        })),
        createdOwners: [], // Will be populated when owner creation is implemented
        errors: uploadResult.errors,
        warnings: uploadResult.warnings,
        processingTime: Date.now() - startTime
      };

      this.updateProgress('complete', 'Import completed successfully!', 100);
      return result;

    } catch (error) {
      devLog.error('Document storage processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.updateProgress('error', `Processing failed: ${errorMessage}`, 0);
      
      return {
        success: false,
        associationId: '',
        associationName: '',
        documentsImported: 0,
        documentsSkipped: 0,
        totalFiles: 0,
        createdProperties: [],
        createdOwners: [],
        errors: [errorMessage],
        warnings: [],
        processingTime: Date.now() - startTime
      };
    }
  }

  private async analyzeZipStructure(zip: JSZip) {
    devLog.info('Analyzing ZIP structure...');
    
    const allPaths = Object.keys(zip.files);
    devLog.info('All ZIP paths:', allPaths);
    
    // Find top-level folders
    const topLevelFolders = new Set<string>();
    
    for (const path of allPaths) {
      const normalizedPath = path.replace(/\/$/, ''); // Remove trailing slash
      const parts = normalizedPath.split('/').filter(part => part.length > 0);
      
      if (parts.length > 0) {
        // Check if this is a directory entry or has subdirectories
        const isDirectory = zip.files[path].dir || path.endsWith('/');
        const hasSubdirectories = allPaths.some(p => p.startsWith(parts[0] + '/') && p !== path);
        
        if (isDirectory || hasSubdirectories) {
          topLevelFolders.add(parts[0]);
          devLog.info(`Found top-level folder: ${parts[0]}`);
        }
      }
    }
    
    devLog.info('Detected top-level folders:', Array.from(topLevelFolders));
    
    if (topLevelFolders.size !== 1) {
      throw new Error(`ZIP file must contain exactly one top-level folder, found: ${Array.from(topLevelFolders).join(', ')}`);
    }
    
    const associationFolder = Array.from(topLevelFolders)[0];
    devLog.info(`Association folder: ${associationFolder}`);
    
    // Find unit folders within the association folder
    const unitFolders: string[] = [];
    const associationPrefix = associationFolder + '/';
    
    for (const path of allPaths) {
      if (path.startsWith(associationPrefix) && path !== associationPrefix) {
        const relativePath = path.substring(associationPrefix.length);
        const parts = relativePath.split('/').filter(part => part.length > 0);
        
        if (parts.length >= 1) {
          const potentialUnitFolder = parts[0];
          if (!unitFolders.includes(potentialUnitFolder) && 
              (zip.files[associationPrefix + potentialUnitFolder + '/'] || 
               allPaths.some(p => p.startsWith(associationPrefix + potentialUnitFolder + '/')))) {
            unitFolders.push(potentialUnitFolder);
            devLog.info(`Found unit folder: ${potentialUnitFolder}`);
          }
        }
      }
    }
    
    devLog.info(`Found ${unitFolders.length} unit folders:`, unitFolders);
    
    return {
      associationFolder,
      unitFolders,
      totalFolders: unitFolders.length
    };
  }

  private async createOrGetAssociation(name: string): Promise<string> {
    try {
      // First try to find existing association
      const { data: existing } = await supabase
        .from('associations')
        .select('id')
        .eq('name', name)
        .maybeSingle();

      if (existing) {
        devLog.info(`Found existing association: ${name}`);
        return existing.id;
      }

      // Create new association
      const { data: newAssociation, error } = await supabase
        .from('associations')
        .insert({
          name,
          address: 'Auto-imported',
          status: 'active'
        })
        .select('id')
        .single();

      if (error) {
        devLog.error('Failed to create association:', error);
        throw new Error(`Failed to create association: ${error.message}`);
      }

      devLog.info(`Created new association: ${name} with ID: ${newAssociation.id}`);

      // Get current user and assign as admin
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: roleError } = await supabase
          .from('association_users')
          .insert({
            association_id: newAssociation.id,
            user_id: user.id,
            role: 'admin'
          });

        if (roleError) {
          devLog.warn('Failed to assign user as admin:', roleError);
        } else {
          devLog.info('Assigned current user as association admin');
        }
      }

      return newAssociation.id;
    } catch (error) {
      devLog.error('Error in createOrGetAssociation:', error);
      throw error;
    }
  }

  private async createPropertiesFromStructure(associationId: string, structure: any) {
    const properties = [];
    
    for (let i = 0; i < structure.unitFolders.length; i++) {
      if (this.cancelled) break;
      
      const unitFolder = structure.unitFolders[i];
      this.updateProgress('creating_properties', 
        `Creating property ${i + 1} of ${structure.unitFolders.length}: ${unitFolder}`, 
        10 + (i / structure.unitFolders.length) * 20);

      try {
        // Parse unit information from folder name
        const unitInfo = this.parseUnitFolder(unitFolder);
        
        const { data: property, error } = await supabase
          .from('properties')
          .insert({
            association_id: associationId,
            address: unitInfo.address,
            unit_number: unitInfo.unitNumber,
            status: 'occupied',
            property_type: 'condo'
          })
          .select()
          .single();

        if (error) {
          devLog.error(`Failed to create property for ${unitFolder}:`, error);
        } else {
          properties.push(property);
          devLog.info(`Created property: ${unitFolder}`);
        }
      } catch (error) {
        devLog.error(`Error creating property for ${unitFolder}:`, error);
      }
    }
    
    return properties;
  }

  private parseUnitFolder(folderName: string) {
    // Try to extract address and unit number from folder name
    // Example: "GOC13696-1490 Rusk Rd. Unit 301"
    const parts = folderName.split('-');
    let address = 'Unknown Address';
    let unitNumber = 'Unknown Unit';
    
    if (parts.length >= 2) {
      const addressPart = parts[1].trim();
      const unitMatch = addressPart.match(/(.+?)\s+Unit\s+(.+)/i);
      
      if (unitMatch) {
        address = unitMatch[1].trim();
        unitNumber = unitMatch[2].trim();
      } else {
        address = addressPart;
        // Try to extract unit number from the first part
        const codeMatch = parts[0].match(/\d+$/);
        if (codeMatch) {
          unitNumber = codeMatch[0];
        }
      }
    } else {
      // Fallback: use the whole folder name as address
      address = folderName;
    }
    
    return { address, unitNumber };
  }

  private async uploadDocumentsFromZip(zip: JSZip, associationId: string, structure: any, properties: any[]) {
    let documentsImported = 0;
    let documentsSkipped = 0;
    let totalFiles = 0;
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Count total files first
    for (const [path, zipEntry] of Object.entries(zip.files)) {
      if (!zipEntry.dir && this.isValidFile(path)) {
        totalFiles++;
      }
    }
    
    let processedFiles = 0;
    
    for (const [path, zipEntry] of Object.entries(zip.files)) {
      if (this.cancelled) break;
      
      if (!zipEntry.dir && this.isValidFile(path)) {
        processedFiles++;
        this.updateProgress('uploading', 
          `Processing file ${processedFiles} of ${totalFiles}: ${path}`, 
          30 + (processedFiles / totalFiles) * 60,
          processedFiles, totalFiles);
        
        try {
          // Get file content as ArrayBuffer
          const arrayBuffer = await zipEntry.async('arraybuffer');
          const blob = new Blob([arrayBuffer]);
          const fileSize = blob.size;
          
          if (fileSize > this.maxFileSize) {
            warnings.push(`File ${path} exceeds size limit (${Math.round(fileSize / 1024 / 1024)}MB)`);
            documentsSkipped++;
            continue;
          }
          
          // Find associated property
          const propertyId = this.findPropertyForFile(path, structure, properties);
          
          // Upload to Supabase storage
          const fileName = path.split('/').pop() || 'unknown';
          const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
          const storagePath = `documents/${associationId}/${Date.now()}-${fileName}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(storagePath, blob);
          
          if (uploadError) {
            errors.push(`Failed to upload ${path}: ${uploadError.message}`);
            documentsSkipped++;
            continue;
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
              name: fileName,
              url: urlData.publicUrl,
              file_type: fileExtension,
              file_size: fileSize,
              category: this.categorizeFile(fileName),
              uploaded_by: (await supabase.auth.getUser()).data.user?.id
            });
          
          if (docError) {
            errors.push(`Failed to create document record for ${path}: ${docError.message}`);
            documentsSkipped++;
          } else {
            documentsImported++;
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Error processing ${path}: ${errorMessage}`);
          documentsSkipped++;
        }
      }
    }
    
    return {
      documentsImported,
      documentsSkipped,
      totalFiles,
      errors,
      warnings
    };
  }

  private isValidFile(path: string): boolean {
    const fileName = path.split('/').pop() || '';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return this.supportedFileTypes.includes(extension) && fileName.length > 0;
  }

  private findPropertyForFile(filePath: string, structure: any, properties: any[]): string | undefined {
    // Extract unit folder from file path
    const pathParts = filePath.split('/');
    if (pathParts.length >= 3) {
      const unitFolder = pathParts[1];
      const property = properties.find(p => {
        const unitInfo = this.parseUnitFolder(unitFolder);
        return p.unit_number === unitInfo.unitNumber;
      });
      return property?.id;
    }
    return undefined;
  }

  private categorizeFile(fileName: string): string {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('insurance')) return 'Insurance';
    if (lowerName.includes('lease')) return 'Lease';
    if (lowerName.includes('deed')) return 'Deed';
    if (lowerName.includes('mortgage')) return 'Mortgage';
    if (lowerName.includes('inspection')) return 'Inspection';
    if (lowerName.includes('repair')) return 'Maintenance';
    if (lowerName.includes('invoice') || lowerName.includes('bill')) return 'Financial';
    
    return 'General';
  }

  async resumeProcessing(zipFile: File): Promise<DocumentStorageResult> {
    // For now, just restart the process
    // In a full implementation, this would resume from saved state
    return this.processHierarchicalZip(zipFile);
  }
}

export const documentStorageProcessor = new DocumentStorageProcessor();
