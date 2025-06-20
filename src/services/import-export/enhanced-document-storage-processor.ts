import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';
import { DocumentStorageResult, ProcessingProgress } from './types/document-types';
import { DocumentUploadInfo } from './types/document-types';

// Define constants for file size limits and accepted file types
const MAX_FILE_SIZE_MB = 300;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.txt', '.docx', '.xlsx', '.csv'];

// Define ValidationResult interface locally to avoid import issues
interface ValidationResult {
  valid: boolean;
  message?: string;
}

interface FolderStructureEntry {
  relativePath: string;
  zipEntry: JSZip.JSZipObject;
  unitNumber?: string;
  address?: string;
}

export class EnhancedDocumentStorageProcessor {
  private static instance: EnhancedDocumentStorageProcessor;
  private progressCallback: ((progress: ProcessingProgress) => void) | null = null;
  private cancelled = false;

  private constructor() {}

  public static getInstance(): EnhancedDocumentStorageProcessor {
    if (!EnhancedDocumentStorageProcessor.instance) {
      EnhancedDocumentStorageProcessor.instance = new EnhancedDocumentStorageProcessor();
    }
    return EnhancedDocumentStorageProcessor.instance;
  }

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback;
  }

  private updateProgress(progress: ProcessingProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
    localStorage.setItem('enhancedDocumentImportProgress', JSON.stringify(progress));
  }

  cancel() {
    this.cancelled = true;
    localStorage.removeItem('enhancedDocumentImportProgress');
  }

  async resumeProcessing(zipFile: File): Promise<DocumentStorageResult> {
    const savedProgress = localStorage.getItem('enhancedDocumentImportProgress');
    if (!savedProgress) {
      throw new Error('No saved progress found. Cannot resume.');
    }

    const progress: ProcessingProgress = JSON.parse(savedProgress);
    devLog.info('Resuming from saved progress:', progress);

    // Here you would re-initialize the state of the processor based on the saved progress
    // and continue from where it left off. This is a complex operation and depends
    // on how you've structured your processing logic.

    // For demonstration purposes, let's just call the main processing function
    // as if it were a new import.
    return this.processHierarchicalZip(zipFile);
  }

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    const startTime = Date.now();
    let associationName = '';
    let associationId = '';
    let associationCreated = false;
    let totalFiles = 0;
    let documentsImported = 0;
    let documentsSkipped = 0;
    const createdProperties: Array<{ unitNumber: string; address: string; id: string }> = [];
    const createdOwners: Array<{ name: string; email: string; id: string }> = [];
    const processingErrors: string[] = [];
    const processingWarnings: string[] = [];

    try {
      this.cancelled = false;
      this.updateProgress({
        stage: 'analyzing',
        message: 'Loading and analyzing ZIP file structure...',
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      });

      // Load ZIP file
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(zipFile);
      
      // Analyze ZIP file structure
      const folderStructure: string[] = [];
      const documentEntries: FolderStructureEntry[] = [];

      zipContent.forEach((relativePath, zipEntry) => {
        if (this.cancelled) return;

        if (zipEntry.dir && relativePath.split('/').length === 1) {
          // Top-level directory is the association name
          associationName = relativePath.slice(0, -1); // Remove trailing slash
          folderStructure.push(relativePath);
        } else if (relativePath.split('/').length === 2 && zipEntry.dir) {
          // Second-level directories are unit numbers
          folderStructure.push(relativePath);
        } else if (!zipEntry.dir && ACCEPTED_FILE_TYPES.some(ext => relativePath.toLowerCase().endsWith(ext))) {
          // Files are documents
          documentEntries.push({
            relativePath,
            zipEntry
          });
        }
      });

      totalFiles = documentEntries.length;

      if (!associationName) {
        throw new Error('Could not determine association name from ZIP file structure.');
      }

      this.updateProgress({
        stage: 'analyzing',
        message: `Association identified: ${associationName}. Analyzing ${totalFiles} documents...`,
        progress: 5,
        filesProcessed: 0,
        totalFiles: totalFiles,
        unitsProcessed: 0,
        totalUnits: folderStructure.length
      });

      // Validate or create association
      const associationValidation = await this.validateAssociationName(associationName);
      if (!associationValidation.valid) {
        processingErrors.push(`Association validation failed: ${associationValidation.message}`);
      } else {
        // Check if association exists
        let { data: existingAssociation, error: associationError } = await supabase
          .from('associations')
          .select('id, name')
          .eq('name', associationName)
          .single();

        if (associationError && associationError.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is expected for new associations
          devLog.error('Error checking association:', associationError);
          processingErrors.push(`Database error: ${associationError.message}`);
        }

        if (!existingAssociation) {
          // Create association if it doesn't exist
          const { data: newAssociation, error: createError } = await supabase
            .from('associations')
            .insert([{ name: associationName }])
            .select('id, name')
            .single();

          if (createError) {
            devLog.error('Error creating association:', createError);
            processingErrors.push(`Failed to create association: ${createError.message}`);
          } else {
            associationId = newAssociation.id;
            associationName = newAssociation.name;
            associationCreated = true;
            devLog.info(`Association "${associationName}" created with ID: ${associationId}`);
          }
        } else {
          associationId = existingAssociation.id;
          associationName = existingAssociation.name;
          devLog.info(`Association "${associationName}" already exists with ID: ${associationId}`);
        }
      }

      // Process documents
      const documentsUploaded: string[] = [];
      const skippedDocuments: string[] = [];

      for (const [index, entry] of documentEntries.entries()) {
        if (this.cancelled) break;

        this.updateProgress({
          stage: 'uploading',
          message: `Processing document ${index + 1} of ${documentEntries.length}: ${entry.relativePath}`,
          progress: 10 + (index / documentEntries.length) * 80,
          filesProcessed: index,
          totalFiles: documentEntries.length,
          unitsProcessed: Math.floor(index / Math.max(1, documentEntries.length / folderStructure.length)),
          totalUnits: folderStructure.length
        });

        try {
          // Get file content - await the async method properly
          const fileContent = await entry.zipEntry.async('blob');
          
          if (fileContent.size > MAX_FILE_SIZE_BYTES) {
            processingWarnings.push(`Skipped ${entry.relativePath}: File size exceeds ${MAX_FILE_SIZE_MB} MB limit.`);
            skippedDocuments.push(entry.relativePath);
            documentsSkipped++;
            continue;
          }

          const folderParts = entry.relativePath.split('/');
          const unitNumber = folderParts[1]; // Assuming second level folder is unit number
          const fileName = folderParts[2]; // Assuming file name is at the third level

          // Check if property exists, create if not
          let { data: existingProperty, error: propertyError } = await supabase
            .from('properties')
            .select('id, unit_number, address')
            .eq('association_id', associationId)
            .eq('unit_number', unitNumber)
            .single();

          if (propertyError && propertyError.code !== 'PGRST116') {
            devLog.error('Error checking property:', propertyError);
            processingErrors.push(`Database error: ${propertyError.message}`);
            continue;
          }

          let propertyId: string | null = null;
          let propertyCreated = false;

          if (!existingProperty) {
            // Create property if it doesn't exist - include required address field
            const { data: newProperty, error: createPropertyError } = await supabase
              .from('properties')
              .insert([{ 
                association_id: associationId, 
                unit_number: unitNumber,
                address: `${unitNumber} (auto-generated)` // Provide required address field
              }])
              .select('id, unit_number, address')
              .single();

            if (createPropertyError) {
              devLog.error('Error creating property:', createPropertyError);
              processingErrors.push(`Failed to create property ${unitNumber}: ${createPropertyError.message}`);
              continue;
            } else {
              propertyId = newProperty.id;
              createdProperties.push({
                unitNumber: newProperty.unit_number,
                address: newProperty.address || 'N/A',
                id: newProperty.id
              });
              propertyCreated = true;
              devLog.info(`Property "${unitNumber}" created with ID: ${propertyId}`);
            }
          } else {
            propertyId = existingProperty.id;
            devLog.info(`Property "${unitNumber}" already exists with ID: ${propertyId}`);
          }

          if (!propertyId) {
            processingErrors.push(`Could not determine property ID for ${unitNumber}`);
            continue;
          }

          // Upload document to Supabase storage
          const fileExtension = fileName.slice(fileName.lastIndexOf('.'));
          const cleanedFileName = fileName.replace(/[^a-zA-Z0-9]/g, '_');
          const storagePath = `associations/${associationId}/properties/${propertyId}/${cleanedFileName}`;

          const { data: storageResult, error: storageError } = await supabase
            .storage
            .from('documents')
            .upload(storagePath, fileContent, {
              contentType: fileContent.type || 'application/octet-stream',
              upsert: false
            });

          if (storageError) {
            devLog.error('Error uploading document:', storageError);
            processingErrors.push(`Failed to upload ${fileName}: ${storageError.message}`);
          } else {
            // Get public URL
            const { data: publicUrlResult } = supabase
              .storage
              .from('documents')
              .getPublicUrl(storagePath);

            // Create document record in database
            const { data: documentRecord, error: documentError } = await supabase
              .from('documents')
              .insert([{
                association_id: associationId,
                property_id: propertyId,
                name: fileName,
                url: publicUrlResult.publicUrl,
                file_type: fileExtension,
                file_size: fileContent.size,
                folder_path: storagePath
              }])
              .select('id')
              .single();

            if (documentError) {
              devLog.error('Error creating document record:', documentError);
              processingErrors.push(`Failed to create document record for ${fileName}: ${documentError.message}`);
            } else {
              documentsUploaded.push(fileName);
              documentsImported++;
              devLog.info(`Document "${fileName}" uploaded and record created with ID: ${documentRecord.id}`);
            }
          }
        } catch (error) {
          const errorMessage = `Failed to process ${entry.relativePath}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          processingErrors.push(errorMessage);
          devLog.error('Document processing error:', error);
        }
      }

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      this.updateProgress({
        stage: 'complete',
        message: 'Enhanced document import completed successfully!',
        progress: 100,
        filesProcessed: totalFiles,
        totalFiles: totalFiles,
        unitsProcessed: folderStructure.length,
        totalUnits: folderStructure.length
      });

      const result: DocumentStorageResult = {
        success: processingErrors.length === 0,
        associationName: associationName,
        associationId: associationId,
        documentsImported: documentsImported,
        documentsSkipped: documentsSkipped,
        totalFiles: totalFiles,
        createdProperties: createdProperties,
        createdOwners: createdOwners,
        errors: processingErrors,
        warnings: processingWarnings,
        processingTime: processingTime
      };

      localStorage.removeItem('enhancedDocumentImportProgress');
      return result;

    } catch (error) {
      devLog.error('Enhanced document storage processing failed:', error);
      throw error;
    }
  }

  private async validateAssociationName(name: string): Promise<ValidationResult> {
    try {
      // Check if association exists
      const { data: existingAssociation, error } = await supabase
        .from('associations')
        .select('id, name')
        .eq('name', name)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new associations
        devLog.error('Error checking association:', error);
        return {
          valid: false,
          message: `Database error: ${error.message}`
        };
      }

      if (existingAssociation) {
        return {
          valid: true,
          message: `Association "${name}" already exists and will be used`
        };
      }

      return {
        valid: true,
        message: `Association "${name}" will be created`
      };
    } catch (error) {
      devLog.error('Association validation error:', error);
      return {
        valid: false,
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async validateWithSupabaseFunction(data: any): Promise<ValidationResult> {
    try {
      const { data: result, error } = await supabase.functions.invoke('validate-import-data', {
        body: { data }
      });

      if (error) {
        devLog.error('Supabase function validation error:', error);
        return {
          valid: false,
          message: `Validation service error: ${error.message}`
        };
      }

      // Properly handle the result from Supabase function
      if (result && typeof result === 'object' && 'valid' in result) {
        return {
          valid: Boolean(result.valid),
          message: result.message ? String(result.message) : undefined
        };
      }

      // Fallback for unexpected response format
      return {
        valid: false,
        message: 'Invalid response from validation service'
      };
    } catch (error) {
      devLog.error('Validation function error:', error);
      return {
        valid: false,
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Use proper type exports for isolatedModules compatibility
export type { DocumentStorageResult, ProcessingProgress } from './types/document-types';

// Export the singleton instance
export const enhancedDocumentStorageProcessor = EnhancedDocumentStorageProcessor.getInstance();
