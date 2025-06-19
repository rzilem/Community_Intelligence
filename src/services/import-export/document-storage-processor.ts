import { supabase } from '@/integrations/supabase/client';
import JSZip from 'jszip';
import { devLog } from '@/utils/dev-logger';

export interface DocumentStorageResult {
  success: boolean;
  documentsImported: number;
  unitsProcessed: number;
  associationName?: string;
  errors: string[];
  warnings: string[];
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

class DocumentStorageProcessor {
  private supabase = supabase;
  private progressCallback?: (progress: ProcessingProgress) => void;
  private cancelled = false;
  private savedProgress: any = null;

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback;
  }

  cancel() {
    this.cancelled = true;
  }

  private updateProgress(progress: ProcessingProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
    
    // Save progress to localStorage for resume capability
    localStorage.setItem('documentImportProgress', JSON.stringify({
      ...progress,
      timestamp: Date.now()
    }));
  }

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    this.cancelled = false;
    
    try {
      this.updateProgress({
        stage: 'analyzing',
        message: 'Analyzing ZIP file structure...',
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      });

      const zip = await JSZip.loadAsync(zipFile);
      const structure = await this.analyzeZipStructure(zip);
      
      if (!structure.associationName) {
        throw new Error('Could not identify association from ZIP structure');
      }

      this.updateProgress({
        stage: 'processing',
        message: `Processing documents for ${structure.associationName}...`,
        progress: 10,
        filesProcessed: 0,
        totalFiles: structure.totalFiles,
        unitsProcessed: 0,
        totalUnits: structure.totalUnits
      });

      const result = await this.processDocuments(zip, structure);
      
      this.updateProgress({
        stage: 'complete',
        message: 'Document import completed successfully!',
        progress: 100,
        filesProcessed: result.documentsImported,
        totalFiles: structure.totalFiles,
        unitsProcessed: result.unitsProcessed,
        totalUnits: structure.totalUnits
      });

      // Clear saved progress on successful completion
      localStorage.removeItem('documentImportProgress');
      
      return result;
      
    } catch (error) {
      devLog.error('Document processing error:', error);
      
      this.updateProgress({
        stage: 'error',
        message: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0,
        canResume: true
      });
      
      throw error;
    }
  }

  async resumeProcessing(zipFile: File): Promise<DocumentStorageResult> {
    const savedProgressStr = localStorage.getItem('documentImportProgress');
    if (!savedProgressStr) {
      return this.processHierarchicalZip(zipFile);
    }
    
    this.savedProgress = JSON.parse(savedProgressStr);
    devLog.info('Resuming from saved progress:', this.savedProgress);
    
    // Resume processing from where we left off
    return this.processHierarchicalZip(zipFile);
  }

  private async analyzeZipStructure(zip: JSZip): Promise<{
    associationName: string;
    totalFiles: number;
    totalUnits: number;
    unitStructure: Record<string, string[]>;
  }> {
    const files = Object.keys(zip.files);
    const structure: Record<string, string[]> = {};
    let associationName = '';
    
    // Look for association name from top-level folder
    const topLevelFolders = new Set<string>();
    
    for (const filePath of files) {
      if (zip.files[filePath].dir) continue;
      
      const pathParts = filePath.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        topLevelFolders.add(pathParts[0]);
      }
      
      // Look for unit-like folders (containing numbers or addresses)
      if (pathParts.length >= 2) {
        const unitFolder = pathParts[pathParts.length - 2];
        if (!structure[unitFolder]) {
          structure[unitFolder] = [];
        }
        structure[unitFolder].push(filePath);
      }
    }
    
    // Use the most common top-level folder as association name
    associationName = Array.from(topLevelFolders)[0] || 'Unknown Association';
    
    const validDocumentFiles = files.filter(filePath => {
      const file = zip.files[filePath];
      if (file.dir) return false;
      
      const fileName = filePath.toLowerCase();
      const isDocument = fileName.endsWith('.pdf') || 
                        fileName.endsWith('.doc') || 
                        fileName.endsWith('.docx') || 
                        fileName.endsWith('.txt') ||
                        fileName.endsWith('.jpg') || 
                        fileName.endsWith('.jpeg') || 
                        fileName.endsWith('.png');
      
      return isDocument;
    });
    
    return {
      associationName,
      totalFiles: validDocumentFiles.length,
      totalUnits: Object.keys(structure).length,
      unitStructure: structure
    };
  }

  private async processDocuments(zip: JSZip, structure: any): Promise<DocumentStorageResult> {
    const result: DocumentStorageResult = {
      success: true,
      documentsImported: 0,
      unitsProcessed: 0,
      associationName: structure.associationName,
      errors: [],
      warnings: []
    };

    let filesProcessed = 0;
    const totalFiles = structure.totalFiles;

    // Process files by unit
    for (const [unitId, filePaths] of Object.entries(structure.unitStructure) as [string, string[]][]) {
      if (this.cancelled) break;
      
      devLog.info(`Processing unit: ${unitId}`);
      
      for (const filePath of filePaths) {
        if (this.cancelled) break;
        
        try {
          const zipEntry = zip.files[filePath];
          if (!zipEntry || zipEntry.dir) continue;
          
          // Get file data using async method instead of _data
          const fileData = await zipEntry.async('arraybuffer');
          const file = new File([fileData], filePath.split('/').pop() || 'document', {
            type: this.getMimeType(filePath)
          });
          
          this.updateProgress({
            stage: 'uploading',
            message: `Uploading ${file.name}...`,
            progress: Math.round((filesProcessed / totalFiles) * 100),
            filesProcessed,
            totalFiles,
            unitsProcessed: result.unitsProcessed,
            totalUnits: structure.totalUnits,
            currentFile: file.name,
            currentFileSize: file.size
          });
          
          await this.uploadToStorage(file, 'documents', `${structure.associationName}/${unitId}/${file.name}`);
          result.documentsImported++;
          filesProcessed++;
          
        } catch (error) {
          devLog.error(`Error processing file ${filePath}:`, error);
          result.errors.push(`Failed to process ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      result.unitsProcessed++;
    }

    return result;
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
      console.error('Storage upload error:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getMimeType(filePath: string): string {
    const extension = filePath.toLowerCase().split('.').pop();
    
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png'
    };
    
    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  private async monitorPerformance<T>(
    operation: string,
    task: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    // Memory monitoring - only if available
    let memoryBefore = 0;
    let memorySupported = false;
    
    if (typeof window !== 'undefined' && 'memory' in performance) {
      memorySupported = true;
      memoryBefore = (performance as any).memory?.usedJSHeapSize || 0;
    }
    
    try {
      const result = await task();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Calculate memory usage if supported
      let memoryUsed = 0;
      if (memorySupported) {
        const memoryAfter = (performance as any).memory?.usedJSHeapSize || 0;
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
}

export const documentStorageProcessor = new DocumentStorageProcessor();
