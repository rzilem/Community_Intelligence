
import { parseService } from './parse-service';
import { advancedOCRService, AdvancedOCRResult } from './advanced-ocr-service';
import { devLog } from '@/utils/dev-logger';

export interface ProcessedDocument {
  filename: string;
  format: string;
  content: any;
  metadata: {
    size: number;
    pages?: number;
    extractionMethod: 'direct' | 'ocr' | 'hybrid';
    confidence?: number;
    processingTime: number;
  };
  errors?: string[];
  warnings?: string[];
}

export interface MultiFormatProcessorOptions {
  enableOCR?: boolean;
  ocrLanguages?: string[];
  fallbackToOCR?: boolean;
  qualityThreshold?: number;
  maxFileSize?: number;
}

export const multiFormatProcessor = {
  async processFile(
    file: File,
    options: MultiFormatProcessorOptions = {}
  ): Promise<ProcessedDocument> {
    const startTime = Date.now();
    devLog.info('Processing file with multi-format processor', { 
      filename: file.name, 
      size: file.size,
      type: file.type 
    });

    try {
      const format = this.detectFormat(file);
      let result: ProcessedDocument;

      switch (format) {
        case 'csv':
        case 'txt':
          result = await this.processTextFile(file, format);
          break;
        case 'excel':
          result = await this.processExcelFile(file);
          break;
        case 'pdf':
          result = await this.processPDFFile(file, options);
          break;
        case 'image':
          result = await this.processImageFile(file, options);
          break;
        case 'word':
          result = await this.processWordFile(file, options);
          break;
        default:
          result = await this.processUnknownFile(file, options);
      }

      result.metadata.processingTime = Date.now() - startTime;
      
      devLog.info('File processing completed', {
        filename: file.name,
        format: result.format,
        extractionMethod: result.metadata.extractionMethod,
        processingTime: result.metadata.processingTime
      });

      return result;
    } catch (error) {
      devLog.error('File processing failed', error);
      throw new Error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async processBatch(
    files: File[],
    options: MultiFormatProcessorOptions = {}
  ): Promise<ProcessedDocument[]> {
    devLog.info('Processing batch of files', { count: files.length });

    const results: ProcessedDocument[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const result = await this.processFile(file, options);
        results.push(result);
      } catch (error) {
        const errorMessage = `Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMessage);
        devLog.error(errorMessage, error);
      }
    }

    if (errors.length > 0) {
      devLog.warn('Batch processing completed with errors', { 
        processed: results.length, 
        failed: errors.length 
      });
    }

    return results;
  },

  detectFormat(file: File): string {
    const extension = file.name.toLowerCase().split('.').pop() || '';
    const mimeType = file.type.toLowerCase();

    // Direct format detection
    if (extension === 'csv' || mimeType.includes('csv')) return 'csv';
    if (extension === 'txt' || mimeType.includes('text/plain')) return 'txt';
    if (['xlsx', 'xls'].includes(extension) || mimeType.includes('spreadsheet')) return 'excel';
    if (extension === 'pdf' || mimeType.includes('pdf')) return 'pdf';
    if (['docx', 'doc'].includes(extension) || mimeType.includes('document')) return 'word';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'].includes(extension) || mimeType.startsWith('image/')) return 'image';

    return 'unknown';
  },

  async processTextFile(file: File, format: string): Promise<ProcessedDocument> {
    const content = await file.text();
    const parsed = await parseService.parseFileContent(content, file.name);

    return {
      filename: file.name,
      format,
      content: parsed.data,
      metadata: {
        size: file.size,
        extractionMethod: 'direct',
        processingTime: 0
      }
    };
  },

  async processExcelFile(file: File): Promise<ProcessedDocument> {
    // For now, attempt to read as text and parse as CSV
    // This would be enhanced with proper Excel parsing
    try {
      const content = await file.text();
      const parsed = await parseService.parseFileContent(content, file.name);

      return {
        filename: file.name,
        format: 'excel',
        content: parsed.data,
        metadata: {
          size: file.size,
          extractionMethod: 'direct',
          processingTime: 0
        },
        warnings: ['Excel file processed as CSV - some formatting may be lost']
      };
    } catch (error) {
      throw new Error(`Excel processing not fully implemented: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async processPDFFile(file: File, options: MultiFormatProcessorOptions): Promise<ProcessedDocument> {
    // PDF processing would require pdf-parse or similar library
    // For now, fall back to OCR if enabled
    if (options.enableOCR || options.fallbackToOCR) {
      return await this.processWithOCR(file, 'pdf', options);
    }

    throw new Error('PDF processing requires OCR to be enabled');
  },

  async processImageFile(file: File, options: MultiFormatProcessorOptions): Promise<ProcessedDocument> {
    if (options.enableOCR || options.fallbackToOCR) {
      return await this.processWithOCR(file, 'image', options);
    }

    throw new Error('Image processing requires OCR to be enabled');
  },

  async processWordFile(file: File, options: MultiFormatProcessorOptions): Promise<ProcessedDocument> {
    // Word processing would require mammoth or similar library
    // For now, fall back to OCR if enabled
    if (options.enableOCR || options.fallbackToOCR) {
      return await this.processWithOCR(file, 'word', options);
    }

    throw new Error('Word document processing requires OCR to be enabled');
  },

  async processUnknownFile(file: File, options: MultiFormatProcessorOptions): Promise<ProcessedDocument> {
    if (options.enableOCR || options.fallbackToOCR) {
      return await this.processWithOCR(file, 'unknown', options);
    }

    throw new Error(`Unsupported file format: ${file.name}`);
  },

  async processWithOCR(
    file: File,
    detectedFormat: string,
    options: MultiFormatProcessorOptions
  ): Promise<ProcessedDocument> {
    try {
      const ocrResult = await advancedOCRService.processDocument(file, {
        languages: options.ocrLanguages || ['eng'],
        enableTableExtraction: true,
        enableFormDetection: true,
        enableLayoutAnalysis: true
      });

      // Convert OCR text to structured data if possible
      let structuredContent: any[] = [];
      if (ocrResult.ocr.text.trim()) {
        try {
          const parsed = await parseService.parseCSV(ocrResult.ocr.text);
          structuredContent = parsed;
        } catch {
          // If CSV parsing fails, return as plain text
          structuredContent = [{ content: ocrResult.ocr.text }];
        }
      }

      return {
        filename: file.name,
        format: detectedFormat,
        content: structuredContent,
        metadata: {
          size: file.size,
          extractionMethod: 'ocr',
          confidence: ocrResult.ocr.confidence,
          processingTime: ocrResult.metadata.processingTime
        },
        warnings: ocrResult.quality.score < 80 ? ['Low OCR confidence - results may be incomplete'] : undefined
      };
    } catch (error) {
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async validateProcessedContent(document: ProcessedDocument): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check if content is empty
    if (!document.content || (Array.isArray(document.content) && document.content.length === 0)) {
      issues.push('No content extracted from document');
      suggestions.push('Try enabling OCR or check if the file is corrupted');
    }

    // Check confidence for OCR results
    if (document.metadata.extractionMethod === 'ocr' && document.metadata.confidence && document.metadata.confidence < 70) {
      issues.push('Low OCR confidence detected');
      suggestions.push('Consider improving image quality or scanning resolution');
    }

    // Check processing time (potential timeout issues)
    if (document.metadata.processingTime > 30000) {
      issues.push('Processing took longer than expected');
      suggestions.push('Consider reducing file size or complexity');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }
};
