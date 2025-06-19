
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';
import { enhancedPropertyMatcher } from './enhanced-property-matcher';
import { intelligentUnitParser } from './intelligent-unit-parser';
import JSZip from 'jszip';

export interface DocumentStorageResult {
  success: boolean;
  associationId: string;
  associationName: string;
  documentsImported: number;
  documentsSkipped: number;
  totalFiles: number;
  createdProperties: Array<{
    unitNumber: string;
    address: string;
  }>;
  errors: string[];
  warnings: string[];
  processingTime: number;
}

export interface ProcessingProgress {
  stage: 'analyzing' | 'importing' | 'complete' | 'error';
  message: string;
  progress: number;
  filesProcessed: number;
  totalFiles: number;
  unitsProcessed: number;
  totalUnits: number;
  canResume?: boolean;
}

class EnhancedDocumentStorageProcessor {
  private progressCallback?: (progress: ProcessingProgress) => void;
  private isCancelled = false;
  private sessionId = '';
  private maxFileSize = 500 * 1024 * 1024; // 500MB

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback;
  }

  cancel() {
    this.isCancelled = true;
    devLog.info('Document storage processor cancelled');
  }

  private updateProgress(update: Partial<ProcessingProgress>) {
    if (this.progressCallback) {
      this.progressCallback(update as ProcessingProgress);
    }
  }

  private async validateFileSize(file: File): Promise<{ valid: boolean; error?: string }> {
    if (file.size > this.maxFileSize) {
      const fileSizeMB = Math.round((file.size / 1024 / 1024) * 100) / 100;
      const maxSizeMB = this.maxFileSize / 1024 / 1024;
      
      return {
        valid: false,
        error: `File "${file.name}" (${fileSizeMB} MB) exceeds the maximum size limit of ${maxSizeMB} MB`
      };
    }
    
    return { valid: true };
  }

  private async findOrCreateAssociation(associationName: string): Promise<string> {
    devLog.info('Finding or creating association:', associationName);

    // First try to find existing association
    const { data: existingAssociations, error: searchError } = await supabase
      .from('associations')
      .select('id, name')
      .ilike('name', `%${associationName}%`)
      .limit(1);

    if (searchError) {
      devLog.error('Error searching for associations:', searchError);
      throw new Error(`Failed to search associations: ${searchError.message}`);
    }

    if (existingAssociations && existingAssociations.length > 0) {
      devLog.info('Found existing association:', existingAssociations[0]);
      return existingAssociations[0].id;
    }

    // Create new association - the trigger will automatically assign the user as admin
    const { data: newAssociation, error: createError } = await supabase
      .from('associations')
      .insert({
        name: associationName,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (createError) {
      devLog.error('Error creating association:', createError);
      throw new Error(`Failed to create association: ${createError.message}`);
    }

    devLog.info('Created new association:', newAssociation);
    return newAssociation.id;
  }

  private async initializeProgressTracking(associationId: string, totalFiles: number): Promise<void> {
    this.sessionId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { error } = await supabase
      .from('document_import_progress')
      .insert({
        session_id: this.sessionId,
        association_id: associationId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        total_files: totalFiles,
        current_stage: 'analyzing'
      });

    if (error) {
      devLog.warn('Failed to initialize progress tracking:', error);
    }
  }

  private async updateProgressTracking(update: Partial<{
    processed_files: number;
    successful_imports: number;
    failed_imports: number;
    created_properties: number;
    current_stage: string;
    stage_progress: number;
    error_details: any[];
    warnings: any[];
  }>) {
    if (!this.sessionId) return;

    const { error } = await supabase
      .from('document_import_progress')
      .update(update)
      .eq('session_id', this.sessionId);

    if (error) {
      devLog.warn('Failed to update progress tracking:', error);
    }
  }

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    const startTime = Date.now();
    let documentsImported = 0;
    let documentsSkipped = 0;
    const errors: string[] = [];
    const warnings: string[] = [];
    const createdProperties: Array<{ unitNumber: string; address: string }> = [];

    try {
      // Validate zip file size
      const sizeValidation = await this.validateFileSize(zipFile);
      if (!sizeValidation.valid) {
        throw new Error(sizeValidation.error!);
      }

      this.updateProgress({
        stage: 'analyzing',
        message: 'Reading ZIP file structure...',
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      });

      const zip = await JSZip.loadAsync(zipFile);
      const files = Object.values(zip.files).filter(file => !file.dir);
      
      if (files.length === 0) {
        throw new Error('No files found in the ZIP archive');
      }

      // Initialize progress tracking
      await this.initializeProgressTracking('', files.length);

      this.updateProgress({
        stage: 'analyzing',
        message: `Found ${files.length} files. Analyzing structure...`,
        progress: 10,
        filesProcessed: 0,
        totalFiles: files.length,
        unitsProcessed: 0,
        totalUnits: 0
      });

      // Extract association name from first folder level
      const firstFile = files[0];
      const associationName = intelligentUnitParser.extractAssociationName(firstFile.name);
      
      if (!associationName) {
        throw new Error('Could not determine association name from ZIP structure');
      }

      // Find or create association
      const associationId = await this.findOrCreateAssociation(associationName);
      await this.updateProgressTracking({ association_id: associationId });

      // Load existing properties for matching
      const existingProperties = await enhancedPropertyMatcher.loadExistingProperties(associationId);
      
      // Group files by unit/property
      const filesByUnit = new Map<string, Array<{ file: JSZip.JSZipObject; propertyId?: string }>>();
      let processedFiles = 0;

      for (const file of files) {
        if (this.isCancelled) {
          throw new Error('Import cancelled by user');
        }

        processedFiles++;
        this.updateProgress({
          stage: 'analyzing',
          message: `Analyzing file structure... (${processedFiles}/${files.length})`,
          progress: 10 + (processedFiles / files.length) * 20,
          filesProcessed: processedFiles,
          totalFiles: files.length,
          unitsProcessed: 0,
          totalUnits: 0
        });

        // Validate individual file size
        const fileContent = await file.async('arraybuffer');
        if (fileContent.byteLength > this.maxFileSize) {
          const fileSizeMB = Math.round((fileContent.byteLength / 1024 / 1024) * 100) / 100;
          warnings.push(`Skipping large file: ${file.name} (${fileSizeMB} MB exceeds 500 MB limit)`);
          documentsSkipped++;
          continue;
        }

        // Find or create property for this file
        const propertyResult = await enhancedPropertyMatcher.findOrCreateProperty(
          file.name,
          associationId,
          existingProperties
        );

        if (propertyResult.property) {
          if (propertyResult.created) {
            createdProperties.push({
              unitNumber: propertyResult.property.unit_number,
              address: propertyResult.property.address
            });
          }

          const unitKey = propertyResult.property.id;
          if (!filesByUnit.has(unitKey)) {
            filesByUnit.set(unitKey, []);
          }
          filesByUnit.get(unitKey)!.push({
            file,
            propertyId: propertyResult.property.id
          });
        } else {
          warnings.push(`Could not determine property for file: ${file.name} - ${propertyResult.reason}`);
          documentsSkipped++;
        }
      }

      const totalUnits = filesByUnit.size;
      let processedUnits = 0;

      this.updateProgress({
        stage: 'importing',
        message: `Importing documents for ${totalUnits} properties...`,
        progress: 30,
        filesProcessed: processedFiles,
        totalFiles: files.length,
        unitsProcessed: 0,
        totalUnits
      });

      // Process documents by unit
      for (const [unitKey, unitFiles] of filesByUnit) {
        if (this.isCancelled) {
          throw new Error('Import cancelled by user');
        }

        processedUnits++;
        const documentsToImport: any[] = [];

        for (const { file, propertyId } of unitFiles) {
          try {
            const fileContent = await file.async('arraybuffer');
            const blob = new Blob([fileContent]);
            
            // Generate unique filename
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            const fileExtension = file.name.split('.').pop() || 'bin';
            const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const uniqueFileName = `${timestamp}_${randomSuffix}_${cleanFileName}`;

            // Upload to Supabase Storage (if storage bucket exists)
            let documentUrl = '';
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('documents')
              .upload(uniqueFileName, blob, {
                contentType: this.getContentType(file.name),
                upsert: false
              });

            if (uploadError) {
              // If storage fails, we'll skip this document but continue
              warnings.push(`Failed to upload ${file.name}: ${uploadError.message}`);
              documentsSkipped++;
              continue;
            }

            if (uploadData) {
              const { data: { publicUrl } } = supabase.storage
                .from('documents')
                .getPublicUrl(uploadData.path);
              documentUrl = publicUrl;
            }

            // Prepare document data
            documentsToImport.push({
              name: file.name,
              url: documentUrl,
              file_type: this.getContentType(file.name),
              file_size: fileContent.byteLength,
              property_id: propertyId,
              folder_path: file.name,
              document_type: this.categorizeDocument(file.name),
              category: 'imported'
            });

          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Failed to process ${file.name}: ${errorMsg}`);
            documentsSkipped++;
          }
        }

        // Bulk import documents for this unit using the database function
        if (documentsToImport.length > 0) {
          try {
            const { data: bulkResult, error: bulkError } = await supabase.rpc(
              'bulk_import_documents',
              {
                p_documents: documentsToImport,
                p_association_id: associationId,
                p_session_id: this.sessionId
              }
            );

            if (bulkError) {
              errors.push(`Bulk import error: ${bulkError.message}`);
              documentsSkipped += documentsToImport.length;
            } else if (bulkResult) {
              documentsImported += bulkResult.successful_imports || 0;
              documentsSkipped += bulkResult.failed_imports || 0;
              
              if (bulkResult.errors && Array.isArray(bulkResult.errors)) {
                bulkResult.errors.forEach((err: any) => {
                  errors.push(`${err.document}: ${err.error}`);
                });
              }
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Failed to import documents for unit: ${errorMsg}`);
            documentsSkipped += documentsToImport.length;
          }
        }

        this.updateProgress({
          stage: 'importing',
          message: `Imported documents for property ${processedUnits}/${totalUnits}...`,
          progress: 30 + (processedUnits / totalUnits) * 60,
          filesProcessed: processedFiles,
          totalFiles: files.length,
          unitsProcessed: processedUnits,
          totalUnits
        });

        await this.updateProgressTracking({
          processed_files: processedFiles,
          successful_imports: documentsImported,
          failed_imports: documentsSkipped,
          created_properties: createdProperties.length,
          current_stage: 'importing',
          stage_progress: (processedUnits / totalUnits) * 100
        });
      }

      // Complete the import
      await this.updateProgressTracking({
        current_stage: 'complete',
        stage_progress: 100,
        error_details: errors,
        warnings: warnings
      });

      this.updateProgress({
        stage: 'complete',
        message: `Import complete! ${documentsImported} documents imported, ${documentsSkipped} skipped.`,
        progress: 100,
        filesProcessed: processedFiles,
        totalFiles: files.length,
        unitsProcessed: processedUnits,
        totalUnits
      });

      return {
        success: true,
        associationId,
        associationName,
        documentsImported,
        documentsSkipped,
        totalFiles: files.length,
        createdProperties,
        errors,
        warnings,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      devLog.error('Document storage processing failed:', error);
      
      errors.push(errorMessage);
      
      await this.updateProgressTracking({
        current_stage: 'error',
        error_details: errors,
        warnings: warnings
      });

      return {
        success: false,
        associationId: '',
        associationName: '',
        documentsImported,
        documentsSkipped,
        totalFiles: 0,
        createdProperties,
        errors,
        warnings,
        processingTime: Date.now() - startTime
      };
    }
  }

  async resumeProcessing(zipFile: File): Promise<DocumentStorageResult> {
    devLog.info('Resuming document processing...');
    // For now, just restart the process
    // In the future, we could implement actual resume functionality using the progress table
    return this.processHierarchicalZip(zipFile);
  }

  private getContentType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'application/pdf';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'gif': return 'image/gif';
      case 'txt': return 'text/plain';
      case 'xls': return 'application/vnd.ms-excel';
      case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default: return 'application/octet-stream';
    }
  }

  private categorizeDocument(fileName: string): string {
    const nameLower = fileName.toLowerCase();
    if (nameLower.includes('lease')) return 'lease';
    if (nameLower.includes('insurance')) return 'insurance';
    if (nameLower.includes('maintenance') || nameLower.includes('repair')) return 'maintenance';
    if (nameLower.includes('legal') || nameLower.includes('contract')) return 'legal';
    if (nameLower.includes('financial') || nameLower.includes('payment')) return 'financial';
    if (nameLower.includes('inspection')) return 'inspection';
    return 'general';
  }
}

export const enhancedDocumentStorageProcessor = new EnhancedDocumentStorageProcessor();
