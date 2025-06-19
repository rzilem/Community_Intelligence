import JSZip from 'jszip';
import { devLog } from '@/utils/dev-logger';
import { supabase } from '@/integrations/supabase/client';

interface ProcessingProgress {
  stage: string;
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

interface DocumentStorageResult {
  success: boolean;
  documentsImported: number;
  unitsProcessed: number;
  associationName?: string;
  warnings: string[];
  errors: string[];
}

type ProgressCallback = (progress: ProcessingProgress) => void;

class DocumentStorageProcessor {
  private progressCallback: ProgressCallback | null = null;
  private result: DocumentStorageResult = {
    success: false,
    documentsImported: 0,
    unitsProcessed: 0,
    warnings: [],
    errors: []
  };
  private cancelled: boolean = false;
  private startTime: number = 0;
  private MAX_FILE_SIZE = 300 * 1024 * 1024; // 300MB
  private savedProgress: ProcessingProgress | null = null;

  setProgressCallback(callback: ProgressCallback) {
    this.progressCallback = callback;
  }

  cancel() {
    this.cancelled = true;
  }

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    this.cancelled = false;
    this.startTime = Date.now();
    this.result = {
      success: false,
      documentsImported: 0,
      unitsProcessed: 0,
      warnings: [],
      errors: []
    };

    try {
      const zip = await JSZip.loadAsync(zipFile);
      
      // Analyze the structure to extract association, units, and documents
      const structure = this.analyzeZipStructure(zip);
      if (!structure.associationName) {
        this.result.errors.push('Could not determine association name from zip structure.');
        this.updateProgress({
          stage: 'error',
          message: 'Could not determine association name',
          progress: 0,
          filesProcessed: 0,
          totalFiles: 0,
          unitsProcessed: 0,
          totalUnits: 0,
          canResume: false
        });
        return this.result;
      }
      this.result.associationName = structure.associationName;

      const totalFiles = Object.keys(zip.files).filter(path => !zip.files[path].dir).length;
      let filesProcessed = 0;
      let unitsProcessed = 0;

      this.updateProgress({
        stage: 'analyzing',
        message: 'Analyzing document structure...',
        progress: 5,
        filesProcessed: 0,
        totalFiles: totalFiles,
        unitsProcessed: 0,
        totalUnits: structure.units.length,
        canResume: true
      });

      // Process files with streaming and memory management
      const files = Object.keys(zip.files).filter(path => !zip.files[path].dir);
      
      for (let i = 0; i < files.length; i++) {
        if (this.cancelled) break;
        
        const filePath = files[i];
        const zipEntry = zip.files[filePath];
        
        try {
          // Use async() method instead of _data property
          const fileData = await zipEntry.async('arraybuffer');
          const file = new File([fileData], filePath.split('/').pop() || 'unknown', {
            type: this.getMimeType(filePath)
          });
          
          // Check file size before processing
          if (file.size > this.MAX_FILE_SIZE) {
            this.result.warnings.push(`File ${filePath} exceeds maximum size (${Math.round(file.size / 1024 / 1024)}MB)`);
            continue;
          }
          
          await this.processFile(file, filePath);
          
          filesProcessed++;
          this.result.documentsImported++;
          
          // Update progress
          const progress = Math.round((filesProcessed / totalFiles) * 100);
          unitsProcessed = structure.units.length; // Assuming all units are processed
          
          this.updateProgress({
            stage: 'processing',
            message: `Importing documents...`,
            progress: progress,
            filesProcessed: filesProcessed,
            totalFiles: totalFiles,
            unitsProcessed: unitsProcessed,
            totalUnits: structure.units.length,
            currentFile: file.name,
            currentFileSize: file.size,
            estimatedTimeRemaining: this.calculateEstimatedTimeRemaining(this.startTime, filesProcessed, totalFiles),
            canResume: true
          });
          
          // Memory management - allow garbage collection
          if (i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
            this.updateMemoryUsage();
          }
          
        } catch (error) {
          this.result.errors.push(`Failed to process ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      this.result.success = this.result.errors.length === 0;
      
      if (this.cancelled) {
        this.updateProgress({
          stage: 'paused',
          message: 'Import paused by user',
          progress: Math.round((filesProcessed / totalFiles) * 100),
          filesProcessed: filesProcessed,
          totalFiles: totalFiles,
          unitsProcessed: unitsProcessed,
          totalUnits: structure.units.length,
          canResume: true
        });
      } else {
        this.updateProgress({
          stage: 'complete',
          message: 'Document import completed',
          progress: 100,
          filesProcessed: filesProcessed,
          totalFiles: totalFiles,
          unitsProcessed: unitsProcessed,
          totalUnits: structure.units.length,
          canResume: false
        });
      }
      
    } catch (error) {
      devLog.error('Error processing zip file:', error);
      this.result.success = false;
      this.result.errors.push(error instanceof Error ? error.message : 'Unknown error');
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
    } finally {
      localStorage.removeItem('documentImportProgress');
    }
    
    return this.result;
  }

  async resumeProcessing(zipFile: File): Promise<DocumentStorageResult> {
    if (!this.savedProgress) {
      devLog.warn('No saved progress found. Starting a new import.');
      return this.processHierarchicalZip(zipFile);
    }

    // Load saved progress
    const savedProgress = this.savedProgress;
    this.cancelled = false;
    this.startTime = Date.now();

    try {
      const zip = await JSZip.loadAsync(zipFile);
      const totalFiles = Object.keys(zip.files).filter(path => !zip.files[path].dir).length;

      // Process files with streaming and memory management
      const files = Object.keys(zip.files).filter(path => !zip.files[path].dir);
      let filesProcessed = savedProgress.filesProcessed;

      for (let i = filesProcessed; i < files.length; i++) {
        if (this.cancelled) break;

        const filePath = files[i];
        const zipEntry = zip.files[filePath];

        try {
          // Use async() method instead of _data property
          const fileData = await zipEntry.async('arraybuffer');
          const file = new File([fileData], filePath.split('/').pop() || 'unknown', {
            type: this.getMimeType(filePath)
          });

          // Check file size before processing
          if (file.size > this.MAX_FILE_SIZE) {
            this.result.warnings.push(`File ${filePath} exceeds maximum size (${Math.round(file.size / 1024 / 1024)}MB)`);
            continue;
          }

          await this.processFile(file, filePath);

          filesProcessed++;
          this.result.documentsImported++;

          // Update progress
          const progress = Math.round((filesProcessed / totalFiles) * 100);

          this.updateProgress({
            stage: 'processing',
            message: `Resuming document import...`,
            progress: progress,
            filesProcessed: filesProcessed,
            totalFiles: totalFiles,
            unitsProcessed: savedProgress.unitsProcessed,
            totalUnits: savedProgress.totalUnits,
            currentFile: file.name,
            currentFileSize: file.size,
            estimatedTimeRemaining: this.calculateEstimatedTimeRemaining(this.startTime, filesProcessed, totalFiles),
            canResume: true
          });

          // Memory management - allow garbage collection
          if (i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
            this.updateMemoryUsage();
          }

        } catch (error) {
          this.result.errors.push(`Failed to process ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      this.result.success = this.result.errors.length === 0;

      if (this.cancelled) {
        this.updateProgress({
          stage: 'paused',
          message: 'Import paused by user',
          progress: Math.round((filesProcessed / totalFiles) * 100),
          filesProcessed: filesProcessed,
          totalFiles: totalFiles,
          unitsProcessed: savedProgress.unitsProcessed,
          totalUnits: savedProgress.totalUnits,
          canResume: true
        });
      } else {
        this.updateProgress({
          stage: 'complete',
          message: 'Document import completed',
          progress: 100,
          filesProcessed: filesProcessed,
          totalFiles: totalFiles,
          unitsProcessed: savedProgress.unitsProcessed,
          totalUnits: savedProgress.totalUnits,
          canResume: false
        });
      }

    } catch (error) {
      devLog.error('Error resuming zip file processing:', error);
      this.result.success = false;
      this.result.errors.push(error instanceof Error ? error.message : 'Unknown error');
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
    } finally {
      localStorage.removeItem('documentImportProgress');
    }

    return this.result;
  }

  private analyzeZipStructure(zip: JSZip): { associationName: string | null, units: string[] } {
    const directories = [];
    const files = [];

    for (const relativePath in zip.files) {
      const file = zip.files[relativePath];
      if (file.dir) {
        directories.push(relativePath);
      } else {
        files.push(relativePath);
      }
    }

    let associationName = null;
    const units: string[] = [];

    if (directories.length > 0) {
      // Assuming the top-level directory is the association name
      const topLevelDir = directories.find(dir => dir.split('/').length === 1);
      associationName = topLevelDir || null;

      // Identify units (subdirectories under the association)
      if (associationName) {
        directories.filter(dir => dir.startsWith(associationName + '/') && dir.split('/').length === 2)
          .forEach(unitDir => units.push(unitDir));
      }
    }

    return { associationName, units };
  }

  private async processFile(file: File, filePath: string): Promise<void> {
    try {
      const associationId = 'your-association-id'; // Replace with actual association ID
      const path = `documents/${associationId}/${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        devLog.error('Error uploading file:', error);
        this.result.errors.push(`Failed to upload ${file.name}: ${error.message}`);
        return;
      }

      const url = `${supabase.supabaseUrl}/storage/v1/object/public/${data.Key}`;
      
      // Mock document metadata creation
      const documentMetadata = {
        id: 'mock-doc-id-' + Math.random(),
        association_id: associationId,
        name: file.name,
        url: url,
        file_type: file.type,
        file_size: file.size,
        uploaded_at: new Date().toISOString()
      };
      
      devLog.info(`Uploaded ${file.name} to ${url}`);
      
    } catch (error) {
      devLog.error('Error in processFile:', error);
      this.result.errors.push(`Error processing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private updateProgress(progress: ProcessingProgress) {
    this.savedProgress = progress;
    localStorage.setItem('documentImportProgress', JSON.stringify(progress));
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  private calculateEstimatedTimeRemaining(startTime: number, filesProcessed: number, totalFiles: number): string {
    const elapsedTime = Date.now() - startTime;
    const averageTimePerFile = elapsedTime / filesProcessed;
    const remainingFiles = totalFiles - filesProcessed;
    const estimatedRemainingTime = averageTimePerFile * remainingFiles;

    const minutes = Math.floor((estimatedRemainingTime / (1000 * 60)) % 60);
    const seconds = Math.floor((estimatedRemainingTime / 1000) % 60);

    return `${minutes}m ${seconds}s`;
  }

  private updateMemoryUsage() {
    if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
      const memoryUsage = window.performance.memory.usedJSHeapSize / window.performance.memory.totalJSHeapSize * 100;
      this.updateProgress({
        ...this.savedProgress!,
        memoryUsage: memoryUsage
      });
    }
  }

  private getMimeType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'txt': 'text/plain',
      'csv': 'text/csv'
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }
}

export const documentStorageProcessor = new DocumentStorageProcessor();
export type { DocumentStorageResult, ProcessingProgress };
