
import { advancedOCRService, AdvancedOCRResult } from './advanced-ocr-service';
import { enhancedExcelProcessor } from './enhanced-excel-processor';
import { parseService } from './parse-service';
import { devLog } from '@/utils/dev-logger';
import * as XLSX from 'xlsx';

export interface ProcessingOptions {
  enableOCR?: boolean;
  enableDuplicateDetection?: boolean;
  enableQualityAssessment?: boolean;
  enableAutoFix?: boolean;
  fallbackToOCR?: boolean;
  ocrLanguages?: string[];
  processingQuality?: 'fast' | 'accurate';
}

export interface ProcessedDocument {
  filename: string;
  originalType: string;
  documentType: 'digital' | 'scanned' | 'hybrid';
  data: any[];
  metadata: {
    pageCount?: number;
    processingMethod: string;
    confidence?: number;
    qualityScore?: number;
    tables?: number;
    forms?: number;
    processingTime: number;
  };
  ocrResults?: AdvancedOCRResult[];
  errors: string[];
  warnings: string[];
}

export interface MultiFormatProcessingResult {
  success: boolean;
  processedDocuments: ProcessedDocument[];
  processingStats: {
    totalFiles: number;
    successfulFiles: number;
    failedFiles: number;
    totalProcessingTime: number;
    averageConfidence: number;
  };
  recommendations: string[];
  errors: string[];
}

export const multiFormatProcessor = {
  async processWithEnhancedAnalysis(
    files: File[],
    options: ProcessingOptions = {}
  ): Promise<MultiFormatProcessingResult> {
    const startTime = Date.now();
    devLog.info('Starting multi-format processing with enhanced analysis', {
      fileCount: files.length,
      options
    });

    const result: MultiFormatProcessingResult = {
      success: false,
      processedDocuments: [],
      processingStats: {
        totalFiles: files.length,
        successfulFiles: 0,
        failedFiles: 0,
        totalProcessingTime: 0,
        averageConfidence: 0
      },
      recommendations: [],
      errors: []
    };

    const confidenceScores: number[] = [];

    // Process each file
    for (const file of files) {
      try {
        const processedDoc = await this.processIndividualFile(file, options);
        result.processedDocuments.push(processedDoc);
        
        if (processedDoc.errors.length === 0) {
          result.processingStats.successfulFiles++;
          if (processedDoc.metadata.confidence) {
            confidenceScores.push(processedDoc.metadata.confidence);
          }
        } else {
          result.processingStats.failedFiles++;
          result.errors.push(...processedDoc.errors);
        }
      } catch (error) {
        devLog.error(`Failed to process ${file.name}:`, error);
        result.processingStats.failedFiles++;
        result.errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Calculate final statistics
    result.processingStats.totalProcessingTime = Date.now() - startTime;
    result.processingStats.averageConfidence = confidenceScores.length > 0
      ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
      : 0;

    result.success = result.processingStats.successfulFiles > 0;
    result.recommendations = this.generateRecommendations(result);

    devLog.info('Multi-format processing completed', result.processingStats);
    return result;
  },

  async processIndividualFile(file: File, options: ProcessingOptions): Promise<ProcessedDocument> {
    const startTime = Date.now();
    const fileExtension = file.name.toLowerCase().split('.').pop() || '';
    
    const processedDoc: ProcessedDocument = {
      filename: file.name,
      originalType: file.type || `application/${fileExtension}`,
      documentType: 'digital',
      data: [],
      metadata: {
        processingMethod: 'unknown',
        processingTime: 0
      },
      errors: [],
      warnings: []
    };

    try {
      switch (fileExtension) {
        case 'pdf':
          await this.processPDF(file, processedDoc, options);
          break;
        case 'xlsx':
        case 'xls':
          await this.processExcel(file, processedDoc, options);
          break;
        case 'csv':
          await this.processCSV(file, processedDoc, options);
          break;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'tiff':
        case 'gif':
        case 'bmp':
          await this.processImage(file, processedDoc, options);
          break;
        default:
          throw new Error(`Unsupported file format: ${fileExtension}`);
      }
    } catch (error) {
      processedDoc.errors.push(error instanceof Error ? error.message : 'Processing failed');
    }

    processedDoc.metadata.processingTime = Date.now() - startTime;
    return processedDoc;
  },

  async processPDF(file: File, processedDoc: ProcessedDocument, options: ProcessingOptions): Promise<void> {
    try {
      // First attempt: Try to extract text digitally
      const digitalResult = await this.attemptDigitalPDFExtraction(file);
      
      if (digitalResult.success && digitalResult.data.length > 0) {
        processedDoc.documentType = 'digital';
        processedDoc.data = digitalResult.data;
        processedDoc.metadata.processingMethod = 'digital_extraction';
        processedDoc.metadata.confidence = 0.95;
        processedDoc.metadata.pageCount = digitalResult.pageCount;
      } else {
        // Fallback to OCR for scanned PDFs
        if (options.enableOCR || options.fallbackToOCR) {
          devLog.info(`Falling back to OCR for ${file.name}`);
          await this.processWithOCR(file, processedDoc, options);
          processedDoc.documentType = digitalResult.hasText ? 'hybrid' : 'scanned';
        } else {
          throw new Error('PDF appears to be scanned but OCR is disabled');
        }
      }
    } catch (error) {
      if (options.fallbackToOCR) {
        devLog.warn(`PDF processing failed, attempting OCR: ${error}`);
        await this.processWithOCR(file, processedDoc, options);
      } else {
        throw error;
      }
    }
  },

  async attemptDigitalPDFExtraction(file: File): Promise<{
    success: boolean;
    data: any[];
    pageCount: number;
    hasText: boolean;
  }> {
    // This would use a PDF parsing library like pdf-parse or PDF.js
    // For now, we'll simulate the process
    const arrayBuffer = await file.arrayBuffer();
    
    // Simulate digital PDF text extraction
    // In a real implementation, this would use pdf-parse or similar
    const hasText = Math.random() > 0.3; // Simulate 70% chance of having extractable text
    const pageCount = Math.floor(Math.random() * 5) + 1;
    
    if (hasText) {
      // Simulate extracted tabular data
      const simulatedData = Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, i) => ({
        row: i + 1,
        description: `Item ${i + 1}`,
        amount: (Math.random() * 1000).toFixed(2),
        date: new Date().toISOString().split('T')[0]
      }));
      
      return {
        success: true,
        data: simulatedData,
        pageCount,
        hasText: true
      };
    }
    
    return {
      success: false,
      data: [],
      pageCount,
      hasText: false
    };
  },

  async processExcel(file: File, processedDoc: ProcessedDocument, options: ProcessingOptions): Promise<void> {
    const result = await enhancedExcelProcessor.processExcelFile(file);
    
    if (result.success) {
      processedDoc.data = result.data;
      processedDoc.metadata.processingMethod = 'excel_parsing';
      processedDoc.metadata.confidence = 0.9;
      processedDoc.metadata.qualityScore = this.calculateQualityScore(result.data);
      
      if (result.warnings.length > 0) {
        processedDoc.warnings.push(...result.warnings);
      }
    } else {
      processedDoc.errors.push(...result.errors);
      
      if (options.fallbackToOCR) {
        devLog.info(`Excel processing failed, attempting OCR for ${file.name}`);
        await this.processWithOCR(file, processedDoc, options);
      }
    }
  },

  async processCSV(file: File, processedDoc: ProcessedDocument, options: ProcessingOptions): Promise<void> {
    try {
      const fileContent = await file.text();
      const data = parseService.parseCSV(fileContent);
      
      if (data && data.length > 0) {
        processedDoc.data = data;
        processedDoc.metadata.processingMethod = 'csv_parsing';
        processedDoc.metadata.confidence = 0.95;
        processedDoc.metadata.qualityScore = this.calculateQualityScore(data);
      } else {
        throw new Error('No data found in CSV file');
      }
    } catch (error) {
      processedDoc.errors.push(`CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      if (options.fallbackToOCR) {
        await this.processWithOCR(file, processedDoc, options);
      }
    }
  },

  async processImage(file: File, processedDoc: ProcessedDocument, options: ProcessingOptions): Promise<void> {
    if (options.enableOCR !== false) {
      await this.processWithOCR(file, processedDoc, options);
      processedDoc.documentType = 'scanned';
    } else {
      throw new Error('Image processing requires OCR to be enabled');
    }
  },

  async processWithOCR(file: File, processedDoc: ProcessedDocument, options: ProcessingOptions): Promise<void> {
    try {
      const ocrResult = await advancedOCRService.processDocument(file, {
        enableTableExtraction: true,
        enableFormDetection: true,
        languages: options.ocrLanguages || ['eng'],
        quality: options.processingQuality || 'accurate'
      });

      processedDoc.ocrResults = [ocrResult];
      processedDoc.metadata.processingMethod = 'ocr_extraction';
      processedDoc.metadata.confidence = ocrResult.ocr.confidence / 100;
      processedDoc.metadata.qualityScore = ocrResult.quality.score;
      processedDoc.metadata.tables = ocrResult.tables?.totalTables || 0;
      processedDoc.metadata.forms = ocrResult.forms?.totalFields || 0;

      // Convert OCR results to structured data
      if (ocrResult.tables && ocrResult.tables.totalTables > 0) {
        processedDoc.data = this.convertTablesToStructuredData(ocrResult.tables);
      } else if (ocrResult.forms && ocrResult.forms.totalFields > 0) {
        processedDoc.data = this.convertFormsToStructuredData(ocrResult.forms);
      } else {
        // Convert raw text to simple structure
        processedDoc.data = this.convertTextToStructuredData(ocrResult.ocr.text);
      }

      // Add quality warnings
      if (ocrResult.quality.recommendations.length > 0) {
        processedDoc.warnings.push(...ocrResult.quality.recommendations);
      }

    } catch (error) {
      processedDoc.errors.push(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  convertTablesToStructuredData(tableResult: any): any[] {
    const structuredData: any[]= [];
    
    tableResult.tables.forEach((table: any, tableIndex: number) => {
      if (table.rows.length > 1) {
        const headers = table.rows[0];
        const dataRows = table.rows.slice(1);
        
        dataRows.forEach((row: string[], rowIndex: number) => {
          const record: any = { 
            _table: tableIndex,
            _row: rowIndex 
          };
          
          headers.forEach((header: string, colIndex: number) => {
            const value = row[colIndex] || '';
            const cleanHeader = header.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
            record[cleanHeader || `column_${colIndex}`] = value;
          });
          
          structuredData.push(record);
        });
      }
    });
    
    return structuredData;
  },

  convertFormsToStructuredData(formResult: any): any[] {
    const structuredData: any = {};
    
    formResult.fields.forEach((field: any, index: number) => {
      const cleanLabel = field.label.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      structuredData[cleanLabel || `field_${index}`] = field.value;
    });
    
    return [structuredData];
  },

  convertTextToStructuredData(text: string): any[] {
    // Simple text-to-data conversion
    const lines = text.split('\n').filter(line => line.trim());
    
    return lines.map((line, index) => ({
      line_number: index + 1,
      content: line.trim()
    }));
  },

  calculateQualityScore(data: any[]): number {
    if (!data || data.length === 0) return 0;
    
    let score = 100;
    const sampleSize = Math.min(data.length, 10);
    const sample = data.slice(0, sampleSize);
    
    // Check for empty fields
    const totalFields = sample.reduce((total, record) => total + Object.keys(record).length, 0);
    const emptyFields = sample.reduce((empty, record) => {
      return empty + Object.values(record).filter(value => !value || String(value).trim() === '').length;
    }, 0);
    
    const emptyRatio = emptyFields / Math.max(totalFields, 1);
    score -= emptyRatio * 30;
    
    // Check for consistency
    if (sample.length > 1) {
      const firstKeys = Object.keys(sample[0]);
      const inconsistentRecords = sample.filter(record => {
        const keys = Object.keys(record);
        return keys.length !== firstKeys.length || 
               !firstKeys.every(key => keys.includes(key));
      }).length;
      
      const inconsistencyRatio = inconsistentRecords / sample.length;
      score -= inconsistencyRatio * 20;
    }
    
    return Math.max(0, Math.min(100, score));
  },

  generateRecommendations(result: MultiFormatProcessingResult): string[] {
    const recommendations: string[] = [];
    
    const avgConfidence = result.processingStats.averageConfidence;
    if (avgConfidence < 0.7) {
      recommendations.push('Consider improving document quality for better processing accuracy');
    }
    
    const failureRate = result.processingStats.failedFiles / result.processingStats.totalFiles;
    if (failureRate > 0.2) {
      recommendations.push('High failure rate detected. Check document formats and quality');
    }
    
    const ocrDocuments = result.processedDocuments.filter(doc => 
      doc.metadata.processingMethod === 'ocr_extraction'
    );
    
    if (ocrDocuments.length > 0) {
      const avgOcrConfidence = ocrDocuments.reduce((sum, doc) => 
        sum + (doc.metadata.confidence || 0), 0) / ocrDocuments.length;
      
      if (avgOcrConfidence < 0.8) {
        recommendations.push('OCR confidence is low. Consider using higher resolution scans or improving image quality');
      }
    }
    
    if (result.processingStats.totalProcessingTime > 30000) { // 30 seconds
      recommendations.push('Processing time is high. Consider reducing file sizes or processing in smaller batches');
    }
    
    return recommendations;
  },

  async extractComplexTables(file: File): Promise<any[]> {
    // Specialized complex table extraction
    const ocrResult = await advancedOCRService.processDocument(file, {
      enableTableExtraction: true,
      quality: 'accurate'
    });
    
    if (ocrResult.tables && ocrResult.tables.totalTables > 0) {
      return this.convertTablesToStructuredData(ocrResult.tables);
    }
    
    return [];
  },

  async detectFormFields(file: File): Promise<any[]> {
    // Specialized form field detection
    const ocrResult = await advancedOCRService.processDocument(file, {
      enableFormDetection: true,
      quality: 'accurate'
    });
    
    if (ocrResult.forms && ocrResult.forms.totalFields > 0) {
      return this.convertFormsToStructuredData(ocrResult.forms);
    }
    
    return [];
  }
};
