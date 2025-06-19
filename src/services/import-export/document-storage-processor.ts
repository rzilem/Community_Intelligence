import JSZip from 'jszip';
import { createClient } from '@supabase/supabase-js';
import { devLog } from '@/utils/dev-logger';

export interface DocumentInfo {
  name: string;
  url: string;
  file_type: string;
  file_size: number;
  description?: string;
  category?: string;
  tags?: string[];
  is_public?: boolean;
  is_archived?: boolean;
  uploaded_by?: string;
  uploaded_at: string;
  last_accessed?: string | null;
  current_version?: number;
}

export interface DocumentStorageResult {
  success: boolean;
  documentsImported: number;
  unitsProcessed: number;
  associationName?: string;
  errors: string[];
  warnings: string[];
  totalFiles?: number;
  skippedFiles?: number;
}

export interface ProcessingProgress {
  stage: 'analyzing' | 'processing' | 'uploading' | 'complete' | 'error' | 'paused';
  message: string;
  progress: number;
  filesProcessed: number;
  totalFiles: number;
  unitsProcessed: number;
  totalUnits: number;
  currentFile?: string;
  currentFileSize?: number;
  estimatedTimeRemaining?: string;
  memoryUsage?: number;
  canResume?: boolean;
}

export interface DocumentMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  processingMethod: string;
  extractionMethod: string;
  confidence: number;
  qualityScore: number;
  tables: number;
  forms: number;
  processingTime: number;
}

// Performance monitoring interface
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

class DocumentStorageProcessor {
  private supabase = createClient(
    'https://cahergndkwfqltxyikyr.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhaGVyZ25ka3dmcWx0eHlpa3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTUzMTYsImV4cCI6MjA1OTY3MTMxNn0.n_tRSJy3M9IaiyrhG02kpvko-pWd6XyYs4khDauxRGQ'
  );

  private progressCallback: ((progress: ProcessingProgress) => void) | null = null;
  private isCancelled = false;
  private batchSize = 10;
  private maxFileSize = 300 * 1024 * 1024; // 300MB
  private supportedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback;
  }

  cancel() {
    this.isCancelled = true;
    devLog.info('Document processing cancelled');
  }

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    this.isCancelled = false;
    const startTime = Date.now();
    
    try {
      // Stage 1: Analysis
      this.updateProgress({
        stage: 'analyzing',
        message: 'Analyzing ZIP structure...',
        progress: 5,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      });

      const zip = await JSZip.loadAsync(zipFile);
      const structure = await this.analyzeZipStructure(zip);
      
      if (this.isCancelled) throw new Error('Processing cancelled');

      // Stage 2: Processing
      const result = await this.processDocumentStructure(zip, structure);
      
      const totalTime = Date.now() - startTime;
      devLog.info(`Total processing time: ${totalTime}ms`);
      
      return result;
      
    } catch (error) {
      devLog.error('Document processing error:', error);
      throw error;
    }
  }

  async resumeProcessing(zipFile: File): Promise<DocumentStorageResult> {
    devLog.info('Resuming document processing from saved state');
    
    // Load saved progress
    const savedProgress = this.loadSavedProgress();
    if (savedProgress) {
      this.updateProgress({
        ...savedProgress,
        message: 'Resuming processing...',
        canResume: false
      });
    }
    
    // Continue processing from where we left off
    return this.processHierarchicalZip(zipFile);
  }

  private async analyzeZipStructure(zip: JSZip): Promise<any> {
    const structure = {
      associationName: '',
      units: new Map(),
      totalFiles: 0,
      supportedFiles: 0
    };

    const entries = Object.entries(zip.files);
    structure.totalFiles = entries.length;

    // Memory monitoring for large ZIP files
    return this.monitorPerformance('ZIP Analysis', async () => {
      for (const [path, zipEntry] of entries) {
        if (this.isCancelled) break;
        
        if (!zipEntry.dir) {
          const pathParts = path.split('/').filter(p => p);
          
          if (pathParts.length >= 2) {
            const associationName = pathParts[0];
            const unitName = pathParts[1];
            
            if (!structure.associationName) {
              structure.associationName = associationName;
            }
            
            if (!structure.units.has(unitName)) {
              structure.units.set(unitName, []);
            }
            
            // Check file type and size
            if (await this.isFileSupported(zipEntry)) {
              structure.units.get(unitName)!.push({
                path,
                name: pathParts[pathParts.length - 1],
                zipEntry
              });
              structure.supportedFiles++;
            }
          }
        }
      }
      
      return structure;
    });
  }

  private async isFileSupported(zipEntry: JSZip.JSZipObject): Promise<boolean> {
    const fileName = zipEntry.name.toLowerCase();
    const extension = fileName.split('.').pop();
    
    // Check file size
    if (zipEntry._data && zipEntry._data.uncompressedSize > this.maxFileSize) {
      return false;
    }
    
    // Check file type by extension
    const supportedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'doc', 'docx'];
    return supportedExtensions.includes(extension || '');
  }

  private async processDocumentStructure(zip: JSZip, structure: any): Promise<DocumentStorageResult> {
    const result: DocumentStorageResult = {
      success: true,
      documentsImported: 0,
      unitsProcessed: 0,
      associationName: structure.associationName,
      errors: [],
      warnings: [],
      totalFiles: structure.supportedFiles,
      skippedFiles: 0
    };

    const units = Array.from(structure.units.entries());
    let processedFiles = 0;

    this.updateProgress({
      stage: 'processing',
      message: 'Processing documents...',
      progress: 10,
      filesProcessed: 0,
      totalFiles: structure.supportedFiles,
      unitsProcessed: 0,
      totalUnits: units.length
    });

    // Process units in batches to manage memory
    for (let i = 0; i < units.length; i += this.batchSize) {
      if (this.isCancelled) break;
      
      const batch = units.slice(i, i + this.batchSize);
      await this.processBatch(batch, zip, result, processedFiles, structure.supportedFiles, units.length);
      
      result.unitsProcessed += batch.length;
      processedFiles += batch.reduce((sum, [, files]) => sum + files.length, 0);
      
      // Force garbage collection opportunity
      if (global.gc) {
        global.gc();
      }
      
      // Save progress periodically
      this.saveProgress({
        stage: 'processing',
        message: `Processed ${result.unitsProcessed} of ${units.length} units`,
        progress: Math.round((processedFiles / structure.supportedFiles) * 80) + 10,
        filesProcessed: processedFiles,
        totalFiles: structure.supportedFiles,
        unitsProcessed: result.unitsProcessed,
        totalUnits: units.length
      });
    }

    // Finalize
    this.updateProgress({
      stage: 'complete',
      message: 'Processing complete!',
      progress: 100,
      filesProcessed: processedFiles,
      totalFiles: structure.supportedFiles,
      unitsProcessed: result.unitsProcessed,
      totalUnits: units.length
    });

    return result;
  }

  private async processBatch(
    batch: [string, any[]][],
    zip: JSZip,
    result: DocumentStorageResult,
    processedFiles: number,
    totalFiles: number,
    totalUnits: number
  ): Promise<void> {
    for (const [unitName, files] of batch) {
      if (this.isCancelled) break;
      
      try {
        for (const fileInfo of files) {
          if (this.isCancelled) break;
          
          await this.processDocument(fileInfo, zip, result);
          processedFiles++;
          
          const progress = Math.round((processedFiles / totalFiles) * 80) + 10;
          this.updateProgress({
            stage: 'processing',
            message: `Processing ${fileInfo.name}...`,
            progress,
            filesProcessed: processedFiles,
            totalFiles,
            unitsProcessed: result.unitsProcessed,
            totalUnits,
            currentFile: fileInfo.name,
            currentFileSize: fileInfo.zipEntry._data?.uncompressedSize
          });
        }
      } catch (error) {
        result.errors.push(`Error processing unit ${unitName}: ${error.message}`);
        devLog.error(`Unit processing error for ${unitName}:`, error);
      }
    }
  }

  private async processDocument(fileInfo: any, zip: JSZip, result: DocumentStorageResult): Promise<void> {
    try {
      // Extract file data using proper JSZip API
      const fileData = await fileInfo.zipEntry.async('arraybuffer');
      const file = new File([fileData], fileInfo.name, {
        type: this.getMimeType(fileInfo.name)
      });

      // Upload to storage
      const uploadResult = await this.uploadToStorage(file, 'documents');
      
      // Store document metadata
      await this.storeDocumentMetadata({
        name: fileInfo.name,
        url: uploadResult.url,
        path: uploadResult.path,
        metadata: uploadResult.metadata
      });

      result.documentsImported++;
      
    } catch (error) {
      result.errors.push(`Failed to process ${fileInfo.name}: ${error.message}`);
      result.skippedFiles = (result.skippedFiles || 0) + 1;
    }
  }

  private async uploadToStorage(
    file: File,
    bucket: string = 'documents',
    path?: string
  ): Promise<{
    url: string;
    path: string;
    metadata: DocumentMetadata;
  }> {
    try {
      const fileName = path || `${Date.now()}_${file.name}`;
      
      // Upload file
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false
        });
      
      if (error) throw error;
      
      // Get public URL using Supabase storage API
      const { data: { publicUrl } } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      
      // Create metadata
      const metadata: DocumentMetadata = {
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        processingMethod: 'storage-upload',
        extractionMethod: 'direct',
        confidence: 1,
        qualityScore: 1,
        tables: 0,
        forms: 0,
        processingTime: 0
      };
      
      return {
        url: publicUrl,
        path: data.path,
        metadata
      };
    } catch (error) {
      devLog.error('Storage upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  private async monitorPerformance<T>(
    operation: string,
    task: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    // Memory monitoring - only if available
    let memoryBefore = 0;
    let memorySupported = false;
    
    const perf = performance as PerformanceWithMemory;
    if (perf.memory) {
      memorySupported = true;
      memoryBefore = perf.memory.usedJSHeapSize;
    }
    
    try {
      const result = await task();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Calculate memory usage if supported
      let memoryUsed = 0;
      if (memorySupported && perf.memory) {
        const memoryAfter = perf.memory.usedJSHeapSize;
        memoryUsed = Math.max(0, memoryAfter - memoryBefore);
      }
      
      // Log performance metrics
      devLog.info(`Performance: ${operation}`, {
        duration: `${duration.toFixed(2)}ms`,
        memoryUsed: memorySupported ? `${(memoryUsed / 1024 / 1024).toFixed(2)}MB` : 'N/A'
      });
      
      return result;
    } catch (error) {
      devLog.error(`Error in ${operation}:`, error);
      throw error;
    }
  }

  private getMimeType(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      txt: 'text/plain',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  private async storeDocumentMetadata(document: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('documents')
        .insert({
          name: document.name,
          url: document.url,
          file_type: document.metadata.mimeType,
          file_size: document.metadata.size,
          uploaded_at: document.metadata.uploadedAt,
          category: 'imported'
        });

      if (error) {
        devLog.warn('Failed to store document metadata:', error);
      }
    } catch (error) {
      devLog.warn('Document metadata storage error:', error);
    }
  }

  private updateProgress(progress: ProcessingProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  private saveProgress(progress: ProcessingProgress) {
    try {
      localStorage.setItem('documentImportProgress', JSON.stringify(progress));
    } catch (error) {
      devLog.warn('Failed to save progress:', error);
    }
  }

  private loadSavedProgress(): ProcessingProgress | null {
    try {
      const saved = localStorage.getItem('documentImportProgress');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      devLog.warn('Failed to load saved progress:', error);
      return null;
    }
  }
}

export const documentStorageProcessor = new DocumentStorageProcessor();
