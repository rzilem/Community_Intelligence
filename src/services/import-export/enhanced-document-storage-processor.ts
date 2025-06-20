
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { DocumentStorageResult, ProcessingProgress } from './types/document-types';
import { enhancedPropertyMatcher } from './enhanced-property-matcher';
import { intelligentUnitParser } from './intelligent-unit-parser';
import { devLog } from '@/utils/dev-logger';

interface ProgressCallback {
  (progress: ProcessingProgress): void;
}

interface ValidationResult {
  valid: boolean;
  message: string;
  error?: string;
  max_size_mb?: number;
  file_size_mb?: number;
}

class EnhancedDocumentStorageProcessor {
  private progressCallback: ProgressCallback | null = null;
  private cancelled = false;

  setProgressCallback(callback: ProgressCallback | null) {
    this.progressCallback = callback;
  }

  private updateProgress(progress: ProcessingProgress) {
    if (this.progressCallback && !this.cancelled) {
      this.progressCallback(progress);
    }
  }

  cancel() {
    this.cancelled = true;
    devLog.info('Enhanced document storage processor cancelled');
  }

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    devLog.info('Starting enhanced hierarchical ZIP processing:', zipFile.name);
    
    const startTime = Date.now();
    this.cancelled = false;

    try {
      // Stage 1: Analyzing ZIP structure
      this.updateProgress({
        stage: 'analyzing',
        message: 'Analyzing ZIP file structure...',
        progress: 5,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      });

      const zip = await JSZip.loadAsync(zipFile);
      const files = Object.values(zip.files).filter(file => !file.dir);
      
      if (files.length === 0) {
        throw new Error('ZIP file contains no documents');
      }

      devLog.info(`Found ${files.length} files in ZIP`);

      // Extract association name from ZIP structure
      const associationName = this.extractAssociationName(files);
      devLog.info('Extracted association name:', associationName);

      this.updateProgress({
        stage: 'analyzing',
        message: `Found ${files.length} files. Creating association: ${associationName}`,
        progress: 15,
        filesProcessed: 0,
        totalFiles: files.length,
        unitsProcessed: 0,
        totalUnits: 0
      });

      // Stage 2: Create or find association
      const association = await this.createOrFindAssociation(associationName);
      
      // Stage 3: Analyze file structure and create properties
      this.updateProgress({
        stage: 'creating_properties',
        message: 'Analyzing file structure and creating properties...',
        progress: 25,
        filesProcessed: 0,
        totalFiles: files.length,
        unitsProcessed: 0,
        totalUnits: 0
      });

      const { documentMappings, createdProperties } = await this.analyzeAndCreateProperties(
        files,
        association.id
      );

      if (this.cancelled) {
        throw new Error('Process was cancelled');
      }

      // Stage 4: Upload documents
      this.updateProgress({
        stage: 'uploading',
        message: 'Uploading documents to storage...',
        progress: 50,
        filesProcessed: 0,
        totalFiles: files.length,
        unitsProcessed: createdProperties.length,
        totalUnits: createdProperties.length
      });

      const uploadResults = await this.uploadDocuments(
        documentMappings,
        association.id,
        files.length
      );

      // Complete
      this.updateProgress({
        stage: 'complete',
        message: 'Enhanced import completed successfully!',
        progress: 100,
        filesProcessed: uploadResults.successful,
        totalFiles: files.length,
        unitsProcessed: createdProperties.length,
        totalUnits: createdProperties.length
      });

      const processingTime = Date.now() - startTime;

      return {
        success: uploadResults.successful > 0,
        associationName: association.name,
        associationId: association.id,
        documentsImported: uploadResults.successful,
        documentsSkipped: uploadResults.failed,
        totalFiles: files.length,
        createdProperties,
        createdOwners: [],
        errors: uploadResults.errors,
        warnings: uploadResults.warnings,
        processingTime
      };

    } catch (error) {
      devLog.error('Enhanced ZIP processing failed:', error);
      
      this.updateProgress({
        stage: 'error',
        message: `Enhanced import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0,
        canResume: true
      });

      return {
        success: false,
        associationName: 'Unknown',
        associationId: '',
        documentsImported: 0,
        documentsSkipped: 0,
        totalFiles: 0,
        createdProperties: [],
        createdOwners: [],
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        warnings: [],
        processingTime: Date.now() - startTime
      };
    }
  }

  async resumeProcessing(zipFile: File): Promise<DocumentStorageResult> {
    devLog.info('Resuming enhanced document processing');
    // For now, just restart the process
    // In the future, we could implement actual resume functionality
    return this.processHierarchicalZip(zipFile);
  }

  private extractAssociationName(files: JSZip.JSZipObject[]): string {
    if (files.length === 0) return 'Imported Association';

    // Get the first file's path and extract the root folder name
    const firstFilePath = files[0].name;
    const pathParts = firstFilePath.split('/');
    
    if (pathParts.length > 1) {
      return pathParts[0] || 'Imported Association';
    }

    return 'Imported Association';
  }

  private async createOrFindAssociation(name: string): Promise<{ id: string; name: string }> {
    devLog.info('Creating or finding association:', name);

    // First, try to find existing association
    const { data: existing } = await supabase
      .from('associations')
      .select('id, name')
      .eq('name', name)
      .single();

    if (existing) {
      devLog.info('Found existing association:', existing);
      return existing;
    }

    // Create new association
    const { data: newAssociation, error } = await supabase
      .from('associations')
      .insert({
        name,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, name')
      .single();

    if (error) {
      devLog.error('Failed to create association:', error);
      throw new Error(`Failed to create association: ${error.message}`);
    }

    devLog.info('Created new association:', newAssociation);
    return newAssociation;
  }

  private async analyzeAndCreateProperties(
    files: JSZip.JSZipObject[],
    associationId: string
  ): Promise<{
    documentMappings: Array<{
      file: JSZip.JSZipObject;
      propertyId: string | null;
      category: string;
    }>;
    createdProperties: Array<{
      unitNumber: string;
      address: string;
      id: string;
    }>;
  }> {
    const documentMappings: Array<{
      file: JSZip.JSZipObject;
      propertyId: string | null;
      category: string;
    }> = [];

    const createdProperties: Array<{
      unitNumber: string;
      address: string;
      id: string;
    }> = [];

    // Load existing properties
    const existingProperties = await enhancedPropertyMatcher.loadExistingProperties(associationId);

    // Group files by folder path to identify properties
    const folderGroups = new Map<string, JSZip.JSZipObject[]>();
    
    for (const file of files) {
      const folderPath = file.name.substring(0, file.name.lastIndexOf('/')) || 'General';
      if (!folderGroups.has(folderPath)) {
        folderGroups.set(folderPath, []);
      }
      folderGroups.get(folderPath)!.push(file);
    }

    // Process each folder group
    for (const [folderPath, folderFiles] of folderGroups) {
      if (this.cancelled) break;

      devLog.info('Processing folder group:', folderPath);

      // Try to match or create property for this folder
      const matchResult = await enhancedPropertyMatcher.findOrCreateProperty(
        folderPath,
        associationId,
        existingProperties
      );

      if (matchResult.property && matchResult.created) {
        createdProperties.push({
          unitNumber: matchResult.property.unit_number,
          address: matchResult.property.address,
          id: matchResult.property.id
        });
      }

      // Map all files in this folder to the property
      for (const file of folderFiles) {
        documentMappings.push({
          file,
          propertyId: matchResult.property?.id || null,
          category: this.categorizeDocument(file.name)
        });
      }
    }

    devLog.info(`Created ${createdProperties.length} properties, mapped ${documentMappings.length} files`);

    return { documentMappings, createdProperties };
  }

  private categorizeDocument(filename: string): string {
    const name = filename.toLowerCase();
    
    if (name.includes('lease')) return 'lease';
    if (name.includes('insurance')) return 'insurance';
    if (name.includes('inspection')) return 'inspection';
    if (name.includes('violation') || name.includes('notice')) return 'violation';
    if (name.includes('bylaw') || name.includes('rule')) return 'governing_documents';
    if (name.includes('financial') || name.includes('budget')) return 'financial';
    
    return 'general';
  }

  private async uploadDocuments(
    documentMappings: Array<{
      file: JSZip.JSZipObject;
      propertyId: string | null;
      category: string;
    }>,
    associationId: string,
    totalFiles: number
  ): Promise<{
    successful: number;
    failed: number;
    errors: string[];
    warnings: string[];
  }> {
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < documentMappings.length; i++) {
      if (this.cancelled) break;

      const mapping = documentMappings[i];
      
      try {
        // Get file content as blob
        const fileBlob = await mapping.file.async('blob');
        
        // Validate file size (500MB limit)
        const validationResult = await this.validateDocumentSize(fileBlob.size);
        if (!validationResult.valid) {
          warnings.push(`Skipped ${mapping.file.name}: ${validationResult.message}`);
          failed++;
          continue;
        }

        // Upload to Supabase storage
        const fileName = `${Date.now()}_${mapping.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `${associationId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, fileBlob, {
            contentType: this.getContentType(mapping.file.name),
            upsert: false
          });

        if (uploadError) {
          errors.push(`Upload failed for ${mapping.file.name}: ${uploadError.message}`);
          failed++;
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        // Save document record to database
        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            association_id: associationId,
            property_id: mapping.propertyId,
            name: mapping.file.name,
            url: publicUrl,
            file_type: this.getFileExtension(mapping.file.name),
            file_size: fileBlob.size,
            category: mapping.category,
            folder_path: mapping.file.name.substring(0, mapping.file.name.lastIndexOf('/')) || 'General',
            uploaded_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (dbError) {
          errors.push(`Database save failed for ${mapping.file.name}: ${dbError.message}`);
          failed++;
        } else {
          successful++;
        }

        // Update progress
        this.updateProgress({
          stage: 'uploading',
          message: `Uploaded ${successful + failed}/${totalFiles} files...`,
          progress: 50 + (((successful + failed) / totalFiles) * 45),
          filesProcessed: successful + failed,
          totalFiles,
          unitsProcessed: 0,
          totalUnits: 0
        });

      } catch (error) {
        errors.push(`Processing failed for ${mapping.file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        failed++;
      }
    }

    return { successful, failed, errors, warnings };
  }

  private async validateDocumentSize(fileSizeBytes: number): Promise<ValidationResult> {
    try {
      const { data } = await supabase.rpc('validate_document_upload', {
        file_size_bytes: fileSizeBytes
      });
      
      // Type assertion since we know the expected structure
      const result = data as ValidationResult;
      return result;
    } catch (error) {
      // Fallback validation if RPC fails
      const maxSizeMB = 500;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      
      if (fileSizeBytes > maxSizeBytes) {
        return {
          valid: false,
          message: `File size (${(fileSizeBytes / 1024 / 1024).toFixed(2)} MB) exceeds maximum allowed size of ${maxSizeMB} MB`,
          error: 'file_too_large',
          max_size_mb: maxSizeMB,
          file_size_mb: Number((fileSizeBytes / 1024 / 1024).toFixed(2))
        };
      }
      
      return {
        valid: true,
        message: 'File size acceptable',
        file_size_mb: Number((fileSizeBytes / 1024 / 1024).toFixed(2))
      };
    }
  }

  private getContentType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const contentTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'txt': 'text/plain'
    };
    return contentTypes[ext || ''] || 'application/octet-stream';
  }

  private getFileExtension(filename: string): string {
    return filename.toLowerCase().split('.').pop() || 'unknown';
  }
}

export const enhancedDocumentStorageProcessor = new EnhancedDocumentStorageProcessor();
export { DocumentStorageResult, ProcessingProgress };
