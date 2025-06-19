
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface DocumentStorageResult {
  success: boolean;
  documentsImported: number;
  unitsProcessed: number;
  categoriesFound: string[];
  associationName: string;
  totalDocuments: number;
  errors: string[];
  warnings: string[];
  summary: Record<string, number>;
  skippedFiles: Array<{
    name: string;
    reason: string;
    size?: number;
  }>;
}

export interface DocumentFile {
  name: string;
  path: string;
  unit: string;
  category: string;
  data: ArrayBuffer;
  mimeType: string;
  size: number;
}

export interface ProcessingProgress {
  stage: 'analyzing' | 'processing' | 'storing' | 'complete' | 'error';
  message: string;
  progress: number;
  currentUnit?: string;
  currentCategory?: string;
  currentFile?: string;
  filesProcessed: number;
  totalFiles: number;
  unitsProcessed: number;
  totalUnits: number;
}

export type ProgressCallback = (progress: ProcessingProgress) => void;

class DocumentStorageProcessor {
  private supportedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  private readonly MAX_FILE_SIZE = 300 * 1024 * 1024; // 300 MB
  private readonly BATCH_SIZE = 5; // Process files in batches
  private isCancelled = false;
  private progressCallback?: ProgressCallback;

  setProgressCallback(callback: ProgressCallback) {
    this.progressCallback = callback;
  }

  cancel() {
    this.isCancelled = true;
  }

  private updateProgress(update: Partial<ProcessingProgress>) {
    if (this.progressCallback) {
      const progress = {
        stage: 'processing' as const,
        message: 'Processing files...',
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0,
        ...update
      };
      
      // Calculate progress percentage
      if (progress.totalFiles > 0) {
        progress.progress = Math.round((progress.filesProcessed / progress.totalFiles) * 100);
      }
      
      this.progressCallback(progress);
    }
  }

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    try {
      this.isCancelled = false;
      devLog.info('Starting hierarchical ZIP processing:', zipFile.name);
      
      this.updateProgress({
        stage: 'analyzing',
        message: 'Analyzing ZIP file structure...',
        progress: 5
      });

      const zip = new JSZip();
      const zipData = await zip.loadAsync(zipFile);
      
      const result: DocumentStorageResult = {
        success: true,
        documentsImported: 0,
        unitsProcessed: 0,
        categoriesFound: [],
        associationName: '',
        totalDocuments: 0,
        errors: [],
        warnings: [],
        summary: {},
        skippedFiles: []
      };
      
      // Analyze ZIP structure
      const structure = await this.analyzeZipStructure(zipData);
      devLog.info('ZIP structure analyzed:', structure);
      
      result.associationName = structure.associationName;
      result.totalDocuments = structure.totalFiles;
      
      const totalUnits = Object.keys(structure.units).length;
      let filesProcessed = 0;
      
      this.updateProgress({
        stage: 'processing',
        message: 'Processing documents...',
        progress: 10,
        totalFiles: structure.totalFiles,
        totalUnits,
        filesProcessed: 0,
        unitsProcessed: 0
      });

      // Process documents by unit
      for (const [unitIndex, unit] of Object.keys(structure.units).entries()) {
        if (this.isCancelled) {
          result.errors.push('Processing was cancelled by user');
          break;
        }

        try {
          devLog.info(`Processing unit: ${unit}`);
          const unitFiles = structure.units[unit];
          
          this.updateProgress({
            currentUnit: unit,
            message: `Processing unit: ${unit}`,
            unitsProcessed: unitIndex,
            filesProcessed
          });

          for (const category of Object.keys(unitFiles)) {
            if (this.isCancelled) break;

            devLog.info(`Processing category: ${category} for unit: ${unit}`);
            const files = unitFiles[category];
            
            this.updateProgress({
              currentCategory: category,
              message: `Processing ${category} documents for ${unit}`,
              filesProcessed
            });

            // Process files in batches
            for (let i = 0; i < files.length; i += this.BATCH_SIZE) {
              if (this.isCancelled) break;

              const batch = files.slice(i, i + this.BATCH_SIZE);
              
              for (const file of batch) {
                if (this.isCancelled) break;

                try {
                  this.updateProgress({
                    currentFile: file.name,
                    message: `Uploading ${file.name}...`,
                    filesProcessed
                  });

                  // Check file size
                  if (file.size > this.MAX_FILE_SIZE) {
                    const sizeMB = Math.round(file.size / (1024 * 1024));
                    result.skippedFiles.push({
                      name: file.name,
                      reason: `File too large (${sizeMB}MB, max 300MB)`,
                      size: file.size
                    });
                    result.warnings.push(`Skipped ${file.name}: File too large (${sizeMB}MB)`);
                    filesProcessed++;
                    continue;
                  }

                  await this.processDocument(file);
                  result.documentsImported++;
                  
                  // Update summary
                  if (!result.summary[category]) {
                    result.summary[category] = 0;
                  }
                  result.summary[category]++;
                  
                  // Track categories
                  if (!result.categoriesFound.includes(category)) {
                    result.categoriesFound.push(category);
                  }

                  filesProcessed++;
                  
                } catch (error) {
                  const errorMsg = `Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                  result.errors.push(errorMsg);
                  devLog.error(errorMsg);
                  filesProcessed++;
                }
              }

              // Small delay between batches to prevent overwhelming the system
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
          
          result.unitsProcessed++;
          
        } catch (error) {
          const errorMsg = `Failed to process unit ${unit}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          devLog.error(errorMsg);
        }
      }

      this.updateProgress({
        stage: 'complete',
        message: `Processing complete! Imported ${result.documentsImported} documents`,
        progress: 100,
        filesProcessed,
        unitsProcessed: result.unitsProcessed
      });
      
      devLog.info('ZIP processing complete:', result);
      return result;
      
    } catch (error) {
      devLog.error('ZIP processing failed:', error);
      
      this.updateProgress({
        stage: 'error',
        message: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0
      });

      return {
        success: false,
        documentsImported: 0,
        unitsProcessed: 0,
        categoriesFound: [],
        associationName: '',
        totalDocuments: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        summary: {},
        skippedFiles: []
      };
    }
  }

  private async analyzeZipStructure(zipData: JSZip): Promise<{
    associationName: string;
    units: Record<string, Record<string, DocumentFile[]>>;
    totalFiles: number;
  }> {
    const structure = {
      associationName: '',
      units: {} as Record<string, Record<string, DocumentFile[]>>,
      totalFiles: 0
    };

    const totalEntries = Object.keys(zipData.files).length;
    let processedEntries = 0;

    // Process each file in the ZIP
    for (const [filePath, zipObject] of Object.entries(zipData.files)) {
      if (zipObject.dir || this.shouldIgnoreFile(filePath)) {
        processedEntries++;
        continue;
      }

      // Update progress during analysis
      if (processedEntries % 10 === 0) {
        const analysisProgress = Math.round((processedEntries / totalEntries) * 5) + 5; // 5-10%
        this.updateProgress({
          stage: 'analyzing',
          message: `Analyzing files... (${processedEntries}/${totalEntries})`,
          progress: analysisProgress
        });
      }

      try {
        const pathParts = filePath.split('/').filter(part => part.length > 0);
        
        if (pathParts.length < 3) {
          devLog.warn(`Skipping file with insufficient path depth: ${filePath}`);
          processedEntries++;
          continue;
        }

        // Extract structure: Association/Unit/Category/File
        const associationName = pathParts[0];
        const unitName = pathParts[1];
        const categoryName = pathParts[2];
        const fileName = pathParts[pathParts.length - 1];

        // Set association name (use first one found)
        if (!structure.associationName) {
          structure.associationName = associationName;
        }

        // Get file data and determine MIME type
        const fileData = await zipObject.async('arraybuffer');
        const mimeType = this.determineMimeType(fileName);
        const fileSize = fileData.byteLength;

        if (!this.supportedTypes.includes(mimeType)) {
          devLog.warn(`Skipping unsupported file type: ${fileName} (${mimeType})`);
          processedEntries++;
          continue;
        }

        // Initialize structure if needed
        if (!structure.units[unitName]) {
          structure.units[unitName] = {};
        }
        if (!structure.units[unitName][categoryName]) {
          structure.units[unitName][categoryName] = [];
        }

        // Add document
        structure.units[unitName][categoryName].push({
          name: fileName,
          path: filePath,
          unit: unitName,
          category: categoryName,
          data: fileData,
          mimeType,
          size: fileSize
        });

        structure.totalFiles++;
        
      } catch (error) {
        devLog.error(`Error processing file ${filePath}:`, error);
      }

      processedEntries++;
    }

    return structure;
  }

  private shouldIgnoreFile(filePath: string): boolean {
    const ignoredPatterns = [
      '__MACOSX',
      '.DS_Store',
      'Thumbs.db',
      '.git'
    ];
    
    return ignoredPatterns.some(pattern => 
      filePath.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private determineMimeType(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop();
    
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif'
    };
    
    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  private async processDocument(file: DocumentFile): Promise<void> {
    try {
      // Generate storage path
      const storagePath = `${file.unit}/${file.category}/${file.name}`;
      
      devLog.info(`Uploading document: ${storagePath} (${Math.round(file.size / 1024)}KB)`);
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file.data, {
          contentType: file.mimeType,
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      devLog.info(`Successfully uploaded: ${storagePath}`);
      
      // Release memory
      // @ts-ignore
      file.data = null;
      
    } catch (error) {
      devLog.error(`Failed to process document ${file.name}:`, error);
      throw error;
    }
  }
}

export const documentStorageProcessor = new DocumentStorageProcessor();
