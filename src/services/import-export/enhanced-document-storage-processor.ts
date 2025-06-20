
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';
import { enhancedPropertyMatcher } from './enhanced-property-matcher';
import { intelligentUnitParser } from './intelligent-unit-parser';
import { DocumentStorageResult, ProcessingProgress, DocumentUploadInfo, AssociationInfo } from './types/document-types';

export type { DocumentStorageResult, ProcessingProgress };

class EnhancedDocumentStorageProcessor {
  private progressCallback?: (progress: ProcessingProgress) => void;
  private cancelled = false;
  private sessionId = '';

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback;
  }

  private updateProgress(update: Partial<ProcessingProgress>) {
    if (this.progressCallback && !this.cancelled) {
      const defaultProgress: ProcessingProgress = {
        stage: 'analyzing',
        message: '',
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      };
      this.progressCallback({ ...defaultProgress, ...update });
    }
  }

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    this.cancelled = false;
    this.sessionId = crypto.randomUUID();
    const startTime = Date.now();

    devLog.info('Starting enhanced document storage processing:', zipFile.name);

    try {
      // Stage 1: Analyze ZIP structure
      this.updateProgress({
        stage: 'analyzing',
        message: 'Analyzing ZIP file structure...',
        progress: 5
      });

      const zip = await JSZip.loadAsync(zipFile);
      const files = Object.keys(zip.files).filter(name => !zip.files[name].dir);
      
      if (files.length === 0) {
        throw new Error('No files found in ZIP archive');
      }

      const documentsToUpload = this.analyzeFileStructure(files, zip);
      const associationInfo = await this.findOrCreateAssociation(documentsToUpload);

      this.updateProgress({
        stage: 'analyzing',
        message: `Found ${files.length} files across ${documentsToUpload.length} units`,
        progress: 15,
        totalFiles: files.length
      });

      // Stage 2: Create properties
      this.updateProgress({
        stage: 'creating_properties',
        message: 'Creating association and properties...',
        progress: 20
      });

      const existingProperties = await enhancedPropertyMatcher.loadExistingProperties(associationInfo.id);
      const createdProperties = await this.createPropertiesFromDocuments(
        documentsToUpload, 
        associationInfo.id, 
        existingProperties
      );

      // Stage 3: Upload documents
      this.updateProgress({
        stage: 'uploading',
        message: 'Processing and uploading documents...',
        progress: 40
      });

      const uploadResults = await this.uploadDocuments(
        documentsToUpload,
        associationInfo.id,
        zip,
        files.length
      );

      // Complete
      const result: DocumentStorageResult = {
        success: true,
        associationName: associationInfo.name,
        associationId: associationInfo.id,
        documentsImported: uploadResults.successful,
        documentsSkipped: uploadResults.skipped,
        totalFiles: files.length,
        createdProperties: createdProperties.map(p => ({
          unitNumber: p.unit_number || 'Unknown',
          address: p.address || '',
          id: p.id
        })),
        createdOwners: [], // Enhanced feature for future implementation
        errors: uploadResults.errors,
        warnings: uploadResults.warnings,
        processingTime: Date.now() - startTime
      };

      this.updateProgress({
        stage: 'complete',
        message: `Import complete! ${uploadResults.successful} documents imported successfully.`,
        progress: 100,
        filesProcessed: files.length,
        totalFiles: files.length
      });

      await this.trackImportProgress(associationInfo.id, result);

      devLog.info('Enhanced document storage processing completed:', result);
      return result;

    } catch (error) {
      devLog.error('Enhanced document storage processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.updateProgress({
        stage: 'error',
        message: `Import failed: ${errorMessage}`,
        progress: 0,
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
        errors: [errorMessage],
        warnings: [],
        processingTime: Date.now() - startTime
      };
    }
  }

  private analyzeFileStructure(files: string[], zip: JSZip): DocumentUploadInfo[] {
    const documentsToUpload: DocumentUploadInfo[] = [];

    for (const filePath of files) {
      const file = zip.files[filePath];
      if (!file || file.dir) continue;

      const parsedInfo = intelligentUnitParser.parseUnitFromPath(filePath);
      
      documentsToUpload.push({
        file: new File([file.async('blob')], filePath.split('/').pop() || filePath),
        folderPath: filePath,
        unitNumber: parsedInfo?.unitNumber,
        address: parsedInfo?.streetAddress,
        category: this.categorizeDocument(filePath)
      });
    }

    return documentsToUpload;
  }

  private async findOrCreateAssociation(documents: DocumentUploadInfo[]): Promise<AssociationInfo> {
    // Extract association name from first document's path
    const firstPath = documents[0]?.folderPath || '';
    const associationName = intelligentUnitParser.extractAssociationName(firstPath) || 'Imported Association';

    // Try to find existing association
    const { data: existing } = await supabase
      .from('associations')
      .select('id, name')
      .ilike('name', `%${associationName}%`)
      .limit(1)
      .single();

    if (existing) {
      devLog.info('Found existing association:', existing);
      return { id: existing.id, name: existing.name, created: false };
    }

    // Create new association
    const { data: newAssociation, error } = await supabase
      .from('associations')
      .insert({
        name: associationName,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select('id, name')
      .single();

    if (error || !newAssociation) {
      throw new Error(`Failed to create association: ${error?.message}`);
    }

    devLog.info('Created new association:', newAssociation);
    return { id: newAssociation.id, name: newAssociation.name, created: true };
  }

  private async createPropertiesFromDocuments(
    documents: DocumentUploadInfo[],
    associationId: string,
    existingProperties: any[]
  ): Promise<any[]> {
    const createdProperties: any[] = [];
    const processedUnits = new Set<string>();

    for (const doc of documents) {
      if (!doc.unitNumber || processedUnits.has(doc.unitNumber)) continue;

      try {
        const matchResult = await enhancedPropertyMatcher.findOrCreateProperty(
          doc.folderPath,
          associationId,
          existingProperties
        );

        if (matchResult.created && matchResult.property) {
          createdProperties.push(matchResult.property);
          processedUnits.add(doc.unitNumber);
        }
      } catch (error) {
        devLog.error('Failed to create property for unit:', doc.unitNumber, error);
      }
    }

    return createdProperties;
  }

  private async uploadDocuments(
    documents: DocumentUploadInfo[],
    associationId: string,
    zip: JSZip,
    totalFiles: number
  ): Promise<{ successful: number; skipped: number; errors: string[]; warnings: string[] }> {
    let successful = 0;
    let skipped = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < documents.length; i++) {
      if (this.cancelled) break;

      const doc = documents[i];
      const progress = 40 + (i / documents.length) * 50;

      this.updateProgress({
        stage: 'uploading',
        message: `Uploading ${doc.folderPath}...`,
        progress,
        filesProcessed: i + 1,
        totalFiles
      });

      try {
        const zipFile = zip.files[doc.folderPath];
        if (!zipFile) {
          skipped++;
          continue;
        }

        const fileBlob = await zipFile.async('blob');
        const fileSizeInBytes = fileBlob.size;

        // Validate file size (500MB limit)
        const validation = await this.validateFileUpload(fileSizeInBytes);
        if (!validation.valid) {
          warnings.push(`${doc.folderPath}: ${validation.message}`);
          skipped++;
          continue;
        }

        // Upload to Supabase storage
        const fileName = `${associationId}/${doc.folderPath}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, fileBlob, {
            upsert: true,
            contentType: this.getContentType(doc.folderPath)
          });

        if (uploadError) {
          errors.push(`Upload failed for ${doc.folderPath}: ${uploadError.message}`);
          skipped++;
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        // Save document record
        await this.saveDocumentRecord(doc, associationId, urlData.publicUrl, fileSizeInBytes);
        successful++;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to process ${doc.folderPath}: ${errorMessage}`);
        skipped++;
      }
    }

    return { successful, skipped, errors, warnings };
  }

  private async validateFileUpload(fileSizeInBytes: number): Promise<{ valid: boolean; message: string }> {
    const { data } = await supabase.rpc('validate_document_upload', {
      file_size_bytes: fileSizeInBytes
    });

    return {
      valid: data?.valid || false,
      message: data?.message || 'File validation failed'
    };
  }

  private async saveDocumentRecord(
    doc: DocumentUploadInfo,
    associationId: string,
    publicUrl: string,
    fileSize: number
  ): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .insert({
        association_id: associationId,
        name: doc.folderPath.split('/').pop() || 'Unknown',
        url: publicUrl,
        file_type: this.getContentType(doc.folderPath),
        file_size: fileSize,
        category: doc.category,
        folder_path: doc.folderPath,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id
      });

    if (error) {
      throw new Error(`Failed to save document record: ${error.message}`);
    }
  }

  private categorizeDocument(filePath: string): string {
    const fileName = filePath.toLowerCase();
    
    if (fileName.includes('lease')) return 'lease';
    if (fileName.includes('insurance')) return 'insurance';
    if (fileName.includes('inspection')) return 'inspection';
    if (fileName.includes('maintenance')) return 'maintenance';
    if (fileName.includes('bylaw')) return 'legal';
    if (fileName.includes('financial') || fileName.includes('statement')) return 'financial';
    
    return 'general';
  }

  private getContentType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'pdf': return 'application/pdf';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'jpg': case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'txt': return 'text/plain';
      default: return 'application/octet-stream';
    }
  }

  private async trackImportProgress(associationId: string, result: DocumentStorageResult): Promise<void> {
    try {
      const { error } = await supabase
        .from('document_import_progress')
        .insert({
          session_id: this.sessionId,
          association_id: associationId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          total_files: result.totalFiles,
          processed_files: result.totalFiles,
          successful_imports: result.documentsImported,
          failed_imports: result.documentsSkipped,
          created_properties: result.createdProperties.length,
          current_stage: 'complete',
          stage_progress: 100,
          error_details: result.errors,
          warnings: result.warnings,
          completed_at: new Date().toISOString()
        });

      if (error) {
        devLog.error('Failed to track import progress:', error);
      }
    } catch (error) {
      devLog.error('Error tracking import progress:', error);
    }
  }

  async resumeProcessing(zipFile: File): Promise<DocumentStorageResult> {
    // For now, restart the process - enhanced resume logic can be added later
    return this.processHierarchicalZip(zipFile);
  }

  cancel() {
    this.cancelled = true;
    devLog.info('Enhanced document storage processing cancelled');
  }
}

export const enhancedDocumentStorageProcessor = new EnhancedDocumentStorageProcessor();
