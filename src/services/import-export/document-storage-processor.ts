
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface ProcessingProgress {
  stage: 'analyzing' | 'processing' | 'complete' | 'error' | 'paused';
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

export interface DocumentStorageResult {
  success: boolean;
  associationName: string;
  documentsImported: number;
  documentsSkipped: number;
  documentsFailed: number;
  totalSize: number;
  warnings: string[];
  errors: string[];
  details: Array<{
    unit: string;
    filename: string;
    status: 'imported' | 'skipped' | 'failed';
    reason?: string;
    size?: number;
    url?: string;
  }>;
  resumeData?: ProcessingState;
}

interface ProcessingState {
  processedFiles: Set<string>;
  processedUnits: Set<string>;
  totalProgress: number;
  lastProcessedPath?: string;
  startTime: number;
}

interface FileToProcess {
  path: string;
  file: JSZip.JSZipObject;
  unit: string;
  filename: string;
  size: number;
  priority: number;
}

class DocumentStorageProcessor {
  private progressCallback: ((progress: ProcessingProgress) => void) | null = null;
  private cancelled = false;
  private processingState: ProcessingState | null = null;
  private readonly MAX_FILE_SIZE = 300 * 1024 * 1024; // 300 MB
  private readonly MAX_BATCH_SIZE = 5;
  private readonly MEMORY_CHECK_INTERVAL = 10;
  private readonly PROCESSING_DELAY = 100; // ms between files

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback;
  }

  cancel() {
    this.cancelled = true;
    devLog.info('Document import cancelled');
  }

  private saveProgressState() {
    if (this.processingState) {
      const stateToSave = {
        ...this.processingState,
        processedFiles: Array.from(this.processingState.processedFiles),
        processedUnits: Array.from(this.processingState.processedUnits),
      };
      localStorage.setItem('documentImportProgress', JSON.stringify(stateToSave));
    }
  }

  private loadProgressState(): ProcessingState | null {
    try {
      const saved = localStorage.getItem('documentImportProgress');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          processedFiles: new Set(parsed.processedFiles || []),
          processedUnits: new Set(parsed.processedUnits || []),
        };
      }
    } catch (error) {
      devLog.error('Failed to load progress state:', error);
    }
    return null;
  }

  private clearProgressState() {
    localStorage.removeItem('documentImportProgress');
  }

  private updateProgress(update: Partial<ProcessingProgress>) {
    if (this.progressCallback) {
      this.progressCallback(update as ProcessingProgress);
    }
    this.saveProgressState();
  }

  private checkMemoryUsage(): number {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      return (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
    }
    return 0;
  }

  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateEstimatedTime(startTime: number, progress: number): string {
    if (progress <= 0) return 'Calculating...';
    
    const elapsed = Date.now() - startTime;
    const estimated = (elapsed / progress) * (100 - progress);
    
    if (estimated < 60000) {
      return `${Math.round(estimated / 1000)}s remaining`;
    } else if (estimated < 3600000) {
      return `${Math.round(estimated / 60000)}m remaining`;
    } else {
      return `${Math.round(estimated / 3600000)}h remaining`;
    }
  }

  private async processFileStream(file: JSZip.JSZipObject, path: string): Promise<{ content: ArrayBuffer; filename: string }> {
    try {
      const content = await file.async('arraybuffer');
      const filename = path.split('/').pop() || 'unknown';
      return { content, filename };
    } catch (error) {
      devLog.error(`Failed to read file ${path}:`, error);
      throw error;
    }
  }

  private async uploadToSupabase(content: ArrayBuffer, filename: string, unit: string, associationName: string): Promise<string> {
    const filePath = `${associationName}/${unit}/${filename}`;
    
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, content, {
          contentType: this.getContentType(filename),
          upsert: false
        });

      if (error) {
        if (error.message.includes('already exists')) {
          devLog.warn(`File already exists: ${filePath}`);
          return filePath;
        }
        throw error;
      }

      devLog.info(`Successfully uploaded: ${filePath}`);
      return data.path;
    } catch (error) {
      devLog.error(`Upload failed for ${filePath}:`, error);
      throw error;
    }
  }

  private getContentType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const contentTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif'
    };
    return contentTypes[ext || ''] || 'application/octet-stream';
  }

  private prioritizeFiles(files: FileToProcess[]): FileToProcess[] {
    return files.sort((a, b) => {
      // Process smaller files first
      if (a.size !== b.size) return a.size - b.size;
      // Then by priority
      return a.priority - b.priority;
    });
  }

  async processHierarchicalZip(zipFile: File, resumeFromSaved = false): Promise<DocumentStorageResult> {
    const startTime = Date.now();
    this.cancelled = false;
    
    // Load previous state if resuming
    if (resumeFromSaved) {
      this.processingState = this.loadProgressState();
    }
    
    if (!this.processingState) {
      this.processingState = {
        processedFiles: new Set(),
        processedUnits: new Set(),
        totalProgress: 0,
        startTime
      };
    }

    const result: DocumentStorageResult = {
      success: false,
      associationName: '',
      documentsImported: 0,
      documentsSkipped: 0,
      documentsFailed: 0,
      totalSize: 0,
      warnings: [],
      errors: [],
      details: [],
      resumeData: this.processingState
    };

    try {
      this.updateProgress({
        stage: 'analyzing',
        message: 'Analyzing ZIP structure...',
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      });

      const zip = new JSZip();
      const zipContent = await zip.loadAsync(zipFile);
      
      // Analyze structure
      const filesToProcess: FileToProcess[] = [];
      const units = new Set<string>();
      let associationName = '';

      for (const [path, file] of Object.entries(zipContent.files)) {
        if (file.dir || this.processingState.processedFiles.has(path)) continue;

        const pathParts = path.split('/').filter(p => p);
        if (pathParts.length < 3) continue;

        if (!associationName) associationName = pathParts[0];
        const unit = pathParts[1];
        const filename = pathParts[pathParts.length - 1];
        const size = file._data?.uncompressedSize || 0;

        // Skip oversized files
        if (size > this.MAX_FILE_SIZE) {
          result.warnings.push(`File ${filename} exceeds 300MB limit (${Math.round(size / 1024 / 1024)}MB)`);
          result.documentsSkipped++;
          continue;
        }

        units.add(unit);
        filesToProcess.push({
          path,
          file,
          unit,
          filename,
          size,
          priority: size < 1024 * 1024 ? 1 : 2 // Prioritize smaller files
        });
      }

      result.associationName = associationName;
      result.totalSize = filesToProcess.reduce((sum, f) => sum + f.size, 0);

      // Prioritize files for processing
      const prioritizedFiles = this.prioritizeFiles(filesToProcess);

      this.updateProgress({
        stage: 'processing',
        message: 'Starting document upload...',
        progress: 0,
        filesProcessed: this.processingState.processedFiles.size,
        totalFiles: prioritizedFiles.length,
        unitsProcessed: this.processingState.processedUnits.size,
        totalUnits: units.size
      });

      // Process files in batches
      for (let i = 0; i < prioritizedFiles.length; i += this.MAX_BATCH_SIZE) {
        if (this.cancelled) {
          result.errors.push('Import cancelled by user');
          break;
        }

        const batch = prioritizedFiles.slice(i, i + this.MAX_BATCH_SIZE);
        
        // Check memory usage
        const memoryUsage = this.checkMemoryUsage();
        if (memoryUsage > 80) {
          await this.delay(1000); // Pause to allow garbage collection
          devLog.warn(`High memory usage detected: ${memoryUsage}%`);
        }

        // Process batch
        for (const fileInfo of batch) {
          if (this.cancelled) break;

          try {
            const progress = ((this.processingState.processedFiles.size + 1) / prioritizedFiles.length) * 100;
            const timeRemaining = this.calculateEstimatedTime(startTime, progress);

            this.updateProgress({
              stage: 'processing',
              message: `Processing ${fileInfo.unit}/${fileInfo.filename}`,
              progress,
              filesProcessed: this.processingState.processedFiles.size,
              totalFiles: prioritizedFiles.length,
              unitsProcessed: this.processingState.processedUnits.size,
              totalUnits: units.size,
              currentFile: fileInfo.filename,
              currentFileSize: fileInfo.size,
              estimatedTimeRemaining: timeRemaining,
              memoryUsage
            });

            // Process file as stream
            const { content, filename } = await this.processFileStream(fileInfo.file, fileInfo.path);
            
            // Upload to Supabase
            await this.uploadToSupabase(content, filename, fileInfo.unit, associationName);

            // Update state
            this.processingState.processedFiles.add(fileInfo.path);
            this.processingState.processedUnits.add(fileInfo.unit);
            result.documentsImported++;

            result.details.push({
              unit: fileInfo.unit,
              filename: fileInfo.filename,
              status: 'imported',
              size: fileInfo.size,
              url: `${associationName}/${fileInfo.unit}/${fileInfo.filename}`
            });

            // Add delay between files to prevent overwhelming
            await this.delay(this.PROCESSING_DELAY);

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            result.errors.push(`Failed to process ${fileInfo.filename}: ${errorMessage}`);
            result.documentsFailed++;

            result.details.push({
              unit: fileInfo.unit,
              filename: fileInfo.filename,
              status: 'failed',
              reason: errorMessage,
              size: fileInfo.size
            });

            devLog.error(`Failed to process ${fileInfo.path}:`, error);
          }
        }
      }

      result.success = !this.cancelled && result.errors.length === 0;

      this.updateProgress({
        stage: result.success ? 'complete' : 'error',
        message: result.success ? 'Import completed successfully!' : 'Import completed with errors',
        progress: 100,
        filesProcessed: this.processingState.processedFiles.size,
        totalFiles: prioritizedFiles.length,
        unitsProcessed: this.processingState.processedUnits.size,
        totalUnits: units.size,
        canResume: !result.success && !this.cancelled
      });

      // Clear progress state on successful completion
      if (result.success) {
        this.clearProgressState();
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Processing failed: ${errorMessage}`);
      devLog.error('Document processing error:', error);

      this.updateProgress({
        stage: 'error',
        message: `Processing failed: ${errorMessage}`,
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
    devLog.info('Resuming document import from saved state');
    return this.processHierarchicalZip(zipFile, true);
  }
}

export const documentStorageProcessor = new DocumentStorageProcessor();
