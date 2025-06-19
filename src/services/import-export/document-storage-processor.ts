
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
  summary: Record<string, number>;
}

export interface DocumentFile {
  name: string;
  path: string;
  unit: string;
  category: string;
  data: ArrayBuffer;
  mimeType: string;
}

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

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    try {
      devLog.info('Starting hierarchical ZIP processing:', zipFile.name);
      
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
        summary: {}
      };
      
      // Analyze ZIP structure
      const structure = await this.analyzeZipStructure(zipData);
      devLog.info('ZIP structure analyzed:', structure);
      
      result.associationName = structure.associationName;
      result.totalDocuments = structure.totalFiles;
      
      // Process documents by unit
      for (const unit of Object.keys(structure.units)) {
        try {
          devLog.info(`Processing unit: ${unit}`);
          const unitFiles = structure.units[unit];
          
          for (const category of Object.keys(unitFiles)) {
            devLog.info(`Processing category: ${category} for unit: ${unit}`);
            const files = unitFiles[category];
            
            for (const file of files) {
              try {
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
              } catch (error) {
                const errorMsg = `Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                result.errors.push(errorMsg);
                devLog.error(errorMsg);
              }
            }
          }
          
          result.unitsProcessed++;
        } catch (error) {
          const errorMsg = `Failed to process unit ${unit}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          devLog.error(errorMsg);
        }
      }
      
      devLog.info('ZIP processing complete:', result);
      return result;
      
    } catch (error) {
      devLog.error('ZIP processing failed:', error);
      return {
        success: false,
        documentsImported: 0,
        unitsProcessed: 0,
        categoriesFound: [],
        associationName: '',
        totalDocuments: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        summary: {}
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

    // Process each file in the ZIP
    for (const [filePath, zipObject] of Object.entries(zipData.files)) {
      if (zipObject.dir || this.shouldIgnoreFile(filePath)) {
        continue;
      }

      try {
        const pathParts = filePath.split('/').filter(part => part.length > 0);
        
        if (pathParts.length < 3) {
          devLog.warn(`Skipping file with insufficient path depth: ${filePath}`);
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

        if (!this.supportedTypes.includes(mimeType)) {
          devLog.warn(`Skipping unsupported file type: ${fileName} (${mimeType})`);
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
          mimeType
        });

        structure.totalFiles++;
        
      } catch (error) {
        devLog.error(`Error processing file ${filePath}:`, error);
      }
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
      
      devLog.info(`Uploading document: ${storagePath}`);
      
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
      
    } catch (error) {
      devLog.error(`Failed to process document ${file.name}:`, error);
      throw error;
    }
  }
}

export const documentStorageProcessor = new DocumentStorageProcessor();
