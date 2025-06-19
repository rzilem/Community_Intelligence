import { parseService } from './parse-service';
import Papa from 'papaparse';
import { advancedOCRService } from './advanced-ocr-service';
import { enhancedDuplicateDetectionService } from './enhanced-duplicate-detection-service';
import { dataQualityService } from './data-quality-service';
import { devLog } from '@/utils/dev-logger';

export interface ProcessedDocument {
  filename: string;
  data: any[];
  headers: string[];
  format: string;
  content?: string;
  extractedData?: any[];
  metadata: {
    processingTime: number;
    confidence: number;
    source: 'direct' | 'ocr' | 'enhanced';
    extractionMethod?: string;
  };
}

export interface MultiFormatProcessorOptions {
  enableOCR?: boolean;
  enableDuplicateDetection?: boolean;
  enableQualityAssessment?: boolean;
  enableAutoFix?: boolean;
  fallbackToOCR?: boolean;
  ocrLanguages?: string[];
  qualityThreshold?: number;
  enableStructureDetection?: boolean;
}

export interface EnhancedProcessingResult {
  processedDocuments: ProcessedDocument[];
  duplicateResults?: any;
  qualityResults?: any;
  recommendations: string[];
  processingStats: {
    totalFiles: number;
    successfulFiles: number;
    failedFiles: number;
    totalProcessingTime: number;
  };
}

export const multiFormatProcessor = {
  async processWithEnhancedAnalysis(
    files: File[],
    options: MultiFormatProcessorOptions = {}
  ): Promise<EnhancedProcessingResult> {
    const startTime = Date.now();
    const processedDocuments: ProcessedDocument[] = [];
    const processingStats = {
      totalFiles: files.length,
      successfulFiles: 0,
      failedFiles: 0,
      totalProcessingTime: 0
    };

    devLog.info('Starting enhanced multi-format processing', { 
      fileCount: files.length, 
      options 
    });

    // Process each file
    for (const file of files) {
      try {
        const processed = await this.processFile(file, options);
        processedDocuments.push(processed);
        processingStats.successfulFiles++;
      } catch (error) {
        devLog.error(`Failed to process ${file.name}`, error);
        processingStats.failedFiles++;
      }
    }

    // Generate processing recommendations
    const recommendations: string[] = [];
    
    if (processingStats.failedFiles > 0) {
      recommendations.push(`${processingStats.failedFiles} files failed to process. Consider checking file formats.`);
    }

    if (options.enableOCR && processedDocuments.some(doc => doc.metadata.source === 'ocr')) {
      recommendations.push('OCR was used for some documents. Verify extracted data accuracy.');
    }

    // Enhanced analysis if enabled
    let duplicateResults: any = null;
    let qualityResults: any = null;

    if (options.enableDuplicateDetection && processedDocuments.length > 1) {
      try {
        const fileData = processedDocuments.map(doc => ({
          filename: doc.filename,
          data: doc.data
        }));
        
        duplicateResults = await enhancedDuplicateDetectionService.detectDuplicatesAdvanced(
          fileData,
          {
            strictMode: false,
            fuzzyMatching: true,
            confidenceThreshold: 0.7
          }
        );
        
        if (duplicateResults.totalDuplicates > 0) {
          recommendations.push(`Found ${duplicateResults.totalDuplicates} potential duplicate records across files.`);
        }
      } catch (error) {
        devLog.error('Duplicate detection failed', error);
      }
    }

    if (options.enableQualityAssessment) {
      try {
        qualityResults = await dataQualityService.assessDataQuality(
          processedDocuments.flatMap(doc => doc.data)
        );
        
        if (qualityResults.overallScore < 80) {
          recommendations.push(`Data quality score is ${qualityResults.overallScore}%. Consider data cleanup.`);
        }
      } catch (error) {
        devLog.error('Quality assessment failed', error);
      }
    }

    processingStats.totalProcessingTime = Date.now() - startTime;

    return {
      processedDocuments,
      duplicateResults,
      qualityResults,
      recommendations,
      processingStats
    };
  },

  async processFile(file: File, options: MultiFormatProcessorOptions = {}): Promise<ProcessedDocument> {
    const startTime = Date.now();
    const fileExtension = file.name.toLowerCase().split('.').pop() || '';
    
    devLog.info(`Processing file: ${file.name}`, { extension: fileExtension });

    try {
      // Try direct processing first
      if (['csv', 'txt'].includes(fileExtension)) {
        const content = await this.fileToText(file);
        const parsed = await parseService.parseFileContent(content, file.name);
        
        return {
          filename: file.name,
          data: parsed.data,
          headers: parsed.headers,
          format: fileExtension,
          content,
          extractedData: parsed.data,
          metadata: {
            processingTime: Date.now() - startTime,
            confidence: 95,
            source: 'direct',
            extractionMethod: 'direct_parse'
          }
        };
      }

      // Excel files (basic support)
      if (['xlsx', 'xls'].includes(fileExtension)) {
        const content = await this.fileToText(file);
        const parsed = await parseService.parseFileContent(content, file.name);
        
        return {
          filename: file.name,
          data: parsed.data,
          headers: parsed.headers,
          format: fileExtension,
          content,
          extractedData: parsed.data,
          metadata: {
            processingTime: Date.now() - startTime,
            confidence: 85,
            source: 'direct',
            extractionMethod: 'excel_parse'
          }
        };
      }

      // Image files - use OCR if enabled
      if (['jpg', 'jpeg', 'png', 'pdf'].includes(fileExtension) && options.enableOCR) {
        const ocrResult = await advancedOCRService.processDocument(file, {
          enableTableExtraction: true,
          enableFormDetection: true,
          languages: options.ocrLanguages || ['eng']
        });

        // Convert OCR text to structured data (simple approach)
        const structuredData = this.extractStructuredDataFromText(ocrResult.ocr.text);

        return {
          filename: file.name,
          data: structuredData.data,
          headers: structuredData.headers,
          format: fileExtension,
          content: ocrResult.ocr.text,
          extractedData: structuredData.data,
          metadata: {
            processingTime: Date.now() - startTime,
            confidence: ocrResult.ocr.confidence,
            source: 'ocr',
            extractionMethod: 'ocr_extraction'
          }
        };
      }

      // Fallback for unsupported formats
      throw new Error(`Unsupported file format: ${fileExtension}`);

    } catch (error) {
      devLog.error(`Error processing ${file.name}`, error);
      
      // Try OCR as fallback if not already attempted
      if (options.fallbackToOCR && options.enableOCR) {
        try {
          const ocrResult = await advancedOCRService.processDocument(file, {
            languages: options.ocrLanguages || ['eng']
          });

          const structuredData = this.extractStructuredDataFromText(ocrResult.ocr.text);

          return {
            filename: file.name,
            data: structuredData.data,
            headers: structuredData.headers,
            format: fileExtension,
            content: ocrResult.ocr.text,
            extractedData: structuredData.data,
            metadata: {
              processingTime: Date.now() - startTime,
              confidence: ocrResult.ocr.confidence,
              source: 'ocr',
              extractionMethod: 'fallback_ocr'
            }
          };
        } catch (ocrError) {
          devLog.error(`OCR fallback failed for ${file.name}`, ocrError);
        }
      }

      throw error;
    }
  },

  async fileToText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  extractStructuredDataFromText(text: string): { data: any[]; headers: string[] } {
    // Simple heuristic to extract tabular data from text
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return { data: [], headers: [] };
    }

    // Try to detect if first line contains headers
    const potentialHeaders = lines[0].split(/[\t,|]/);
    const isHeaderRow = potentialHeaders.length > 1 && 
      potentialHeaders.every(h => h.trim().length > 0 && !/^\d+$/.test(h.trim()));

    if (isHeaderRow) {
      const headers = potentialHeaders.map(h => h.trim());
      const dataRows = lines.slice(1);
      
      const data = dataRows.map(line => {
        const values = line.split(/[\t,|]/);
        const record: any = {};
        
        headers.forEach((header, index) => {
          record[header] = index < values.length ? values[index].trim() : '';
        });
        
        return record;
      });

      return { data, headers };
    }

    // Fallback: treat as simple list
    return {
      data: lines.map((line, index) => ({ line: line.trim(), index: index + 1 })),
      headers: ['line', 'index']
    };
  }
};
