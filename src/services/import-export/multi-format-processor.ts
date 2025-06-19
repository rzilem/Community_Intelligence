import * as XLSX from 'xlsx';  
import Papa from 'papaparse';
import { advancedOCRService } from './advanced-ocr-service';
import { enhancedDuplicateDetectionService } from './enhanced-duplicate-detection-service';
import { dataQualityService } from './data-quality-service';
import { devLog } from '@/utils/dev-logger';

export interface ProcessedDocument {
  filename: string;
  type: string;
  size: number;
  data: any[];
  extractedData?: any[]; // Add the missing property
  structure?: {
    headers: string[];
    rowCount: number;
    columnCount: number;
    dataTypes: Record<string, string>;
  };
  quality?: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  metadata?: {
    processingTime: number;
    confidence: number;
    source: 'direct' | 'ocr' | 'enhanced';
  };
}

export interface MultiFormatProcessorOptions {
  enableOCR?: boolean;
  enableStructureDetection?: boolean;
  enableDataValidation?: boolean;
  enableAutoFix?: boolean;
  strictMode?: boolean;
}

export interface EnhancedProcessingResult {
  processedDocuments: ProcessedDocument[];
  duplicateResults?: any;
  qualityResults?: any;
  recommendations?: string[];
  processingStats?: {
    totalFiles: number;
    successfulFiles: number;
    processingTime: number;
  };
}

export const multiFormatProcessor = {
  async processFile(file: File, options: MultiFormatProcessorOptions = {}): Promise<ProcessedDocument> {
    const startTime = Date.now();
    devLog.info('Processing file:', { filename: file.name, type: file.type, size: file.size });

    try {
      let data: any[] = [];
      let processingSource: 'direct' | 'ocr' | 'enhanced' = 'direct';

      // Attempt direct processing first
      if (this.isExcelFile(file)) {
        data = await this.processExcelFile(file);
      } else if (this.isCSVFile(file)) {
        data = await this.processCSVFile(file);
      } else if (this.isPDFFile(file) && options.enableOCR) {
        const ocrResult = await advancedOCRService.processDocument(file);
        data = this.extractDataFromOCR(ocrResult);
        processingSource = 'ocr';
      } else {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      // Structure detection
      let structure;
      if (options.enableStructureDetection && data.length > 0) {
        structure = this.detectStructure(data);
      }

      // Data validation and quality assessment
      let quality;
      if (options.enableDataValidation) {
        quality = await this.assessDataQuality(data);
      }

      const processedDocument: ProcessedDocument = {
        filename: file.name,
        type: file.type,
        size: file.size,
        data,
        extractedData: data, // Set extractedData to the same as data
        structure,
        quality,
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: this.calculateConfidence(data, structure, quality),
          source: processingSource
        }
      };

      devLog.info('File processing completed:', {
        filename: file.name,
        recordCount: data.length,
        processingTime: processedDocument.metadata?.processingTime
      });

      return processedDocument;
    } catch (error) {
      devLog.error('File processing failed:', error);
      throw new Error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async processBatch(files: File[], options: MultiFormatProcessorOptions = {}): Promise<ProcessedDocument[]> {
    devLog.info('Processing batch of files:', { count: files.length });

    const results: ProcessedDocument[] = [];
    
    for (const file of files) {
      try {
        const result = await this.processFile(file, options);
        results.push(result);
      } catch (error) {
        devLog.error(`Failed to process ${file.name}:`, error);
        // Continue with other files
        results.push({
          filename: file.name,
          type: file.type,
          size: file.size,
          data: [],
          extractedData: [], // Add extractedData for error cases too
          metadata: {
            processingTime: 0,
            confidence: 0,
            source: 'direct'
          }
        });
      }
    }

    return results;
  },

  async processWithEnhancedAnalysis(
    files: File[], 
    options: {
      enableOCR?: boolean;
      enableDuplicateDetection?: boolean;
      enableQualityAssessment?: boolean;
      enableAutoFix?: boolean;
      fallbackToOCR?: boolean;
    } = {}
  ): Promise<EnhancedProcessingResult> {
    const startTime = Date.now();
    devLog.info('Starting enhanced analysis processing:', { fileCount: files.length });

    try {
      // Step 1: Process all files
      const processedDocuments = await this.processBatch(files, {
        enableOCR: options.enableOCR,
        enableStructureDetection: true,
        enableDataValidation: true,
        enableAutoFix: options.enableAutoFix
      });

      const result: EnhancedProcessingResult = {
        processedDocuments,
        processingStats: {
          totalFiles: files.length,
          successfulFiles: processedDocuments.filter(doc => doc.data.length > 0).length,
          processingTime: Date.now() - startTime
        }
      };

      // Step 2: Enhanced duplicate detection (if enabled)
      if (options.enableDuplicateDetection) {
        const fileData = processedDocuments
          .filter(doc => doc.extractedData && doc.extractedData.length > 0)
          .map(doc => ({
            filename: doc.filename,
            data: doc.extractedData!
          }));

        if (fileData.length > 1) {
          result.duplicateResults = await enhancedDuplicateDetectionService.detectDuplicatesAdvanced(
            fileData,
            {
              strictMode: false,
              fuzzyMatching: true,
              confidenceThreshold: 0.7,
              semanticAnalysis: true
            }
          );
        }
      }

      // Step 3: Overall quality assessment (if enabled)
      if (options.enableQualityAssessment) {
        const allData = processedDocuments
          .filter(doc => doc.extractedData && doc.extractedData.length > 0)
          .map(doc => doc.extractedData!)
          .flat();

        if (allData.length > 0) {
          result.qualityResults = await dataQualityService.assessDataQuality(allData);
        }
      }

      // Step 4: Generate recommendations
      result.recommendations = this.generateProcessingRecommendations(
        processedDocuments,
        result.duplicateResults,
        result.qualityResults
      );

      devLog.info('Enhanced analysis completed:', {
        totalFiles: result.processingStats?.totalFiles,
        successfulFiles: result.processingStats?.successfulFiles,
        duplicatesFound: result.duplicateResults?.totalDuplicates || 0,
        qualityScore: result.qualityResults?.overallScore || 0
      });

      return result;
    } catch (error) {
      devLog.error('Enhanced analysis failed:', error);
      throw error;
    }
  },

  isExcelFile(file: File): boolean {
    return file.type.includes('spreadsheet') || 
           file.name.endsWith('.xlsx') || 
           file.name.endsWith('.xls');
  },

  isCSVFile(file: File): boolean {
    return file.type === 'text/csv' || file.name.endsWith('.csv');
  },

  isPDFFile(file: File): boolean {
    return file.type === 'application/pdf' || file.name.endsWith('.pdf');
  },

  async processExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  },

  async processCSVFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: reject
      });
    });
  },

  extractDataFromOCR(ocrResult: any): any[] {
    // Convert OCR text to structured data
    const lines = ocrResult.ocr.text.split('\n').filter((line: string) => line.trim());
    
    if (lines.length === 0) return [];

    // Simple heuristic: first line as headers, rest as data
    const headers = lines[0].split(/\s{2,}|\t/).map((h: string) => h.trim());
    const data = lines.slice(1).map((line: string) => {
      const values = line.split(/\s{2,}|\t/).map((v: string) => v.trim());
      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      return record;
    });

    return data;
  },

  detectStructure(data: any[]): ProcessedDocument['structure'] {
    if (data.length === 0) return undefined;

    const sample = data[0];
    const headers = Object.keys(sample);
    const dataTypes: Record<string, string> = {};

    headers.forEach(header => {
      const values = data.map(row => row[header]).filter(v => v != null);
      dataTypes[header] = this.detectDataType(values);
    });

    return {
      headers,
      rowCount: data.length,
      columnCount: headers.length,
      dataTypes
    };
  },

  async assessDataQuality(data: any[]): Promise<ProcessedDocument['quality']> {
    // Basic quality assessment
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    if (data.length === 0) {
      return { score: 0, issues: ['No data found'], suggestions: ['Verify file content'] };
    }

    // Check for empty fields
    const emptyFieldRatio = this.calculateEmptyFieldRatio(data);
    if (emptyFieldRatio > 0.1) {
      issues.push(`${(emptyFieldRatio * 100).toFixed(1)}% empty fields`);
      suggestions.push('Consider data cleanup');
      score -= emptyFieldRatio * 30;
    }

    // Check for duplicate rows
    const duplicateRatio = this.calculateDuplicateRatio(data);
    if (duplicateRatio > 0.05) {
      issues.push(`${(duplicateRatio * 100).toFixed(1)}% duplicate rows`);
      suggestions.push('Remove duplicate entries');
      score -= duplicateRatio * 20;
    }

    return {
      score: Math.max(0, Math.round(score)),
      issues,
      suggestions
    };
  },

  calculateConfidence(data: any[], structure?: ProcessedDocument['structure'], quality?: ProcessedDocument['quality']): number {
    let confidence = 0.5; // base confidence

    if (data.length > 0) confidence += 0.2;
    if (structure) confidence += 0.2;
    if (quality && quality.score > 80) confidence += 0.1;

    return Math.min(confidence, 1.0);
  },

  detectDataType(values: any[]): string {
    if (values.length === 0) return 'unknown';

    const sample = values.slice(0, Math.min(100, values.length));
    let numbers = 0;
    let dates = 0;
    let emails = 0;

    sample.forEach(value => {
      const str = String(value);
      if (!isNaN(Number(str)) && str.trim() !== '') numbers++;
      if (this.isDateLike(str)) dates++;
      if (this.isEmailLike(str)) emails++;
    });

    const total = sample.length;
    if (numbers / total > 0.8) return 'number';
    if (dates / total > 0.5) return 'date';
    if (emails / total > 0.5) return 'email';
    
    return 'text';
  },

  isDateLike(str: string): boolean {
    return /^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/.test(str) || 
           /^\d{4}-\d{2}-\d{2}$/.test(str);
  },

  isEmailLike(str: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  },

  calculateEmptyFieldRatio(data: any[]): number {
    if (data.length === 0) return 0;

    let totalFields = 0;
    let emptyFields = 0;

    data.forEach(row => {
      Object.values(row).forEach(value => {
        totalFields++;
        if (value == null || String(value).trim() === '') {
          emptyFields++;
        }
      });
    });

    return totalFields > 0 ? emptyFields / totalFields : 0;
  },

  calculateDuplicateRatio(data: any[]): number {
    if (data.length === 0) return 0;

    const seen = new Set();
    let duplicates = 0;

    data.forEach(row => {
      const key = JSON.stringify(row);
      if (seen.has(key)) {
        duplicates++;
      } else {
        seen.add(key);
      }
    });

    return duplicates / data.length;
  },

  generateProcessingRecommendations(
    processedDocuments: ProcessedDocument[],
    duplicateResults?: any,
    qualityResults?: any
  ): string[] {
    const recommendations: string[] = [];

    const successfulFiles = processedDocuments.filter(doc => doc.data.length > 0);
    const failedFiles = processedDocuments.filter(doc => doc.data.length === 0);

    if (failedFiles.length > 0) {
      recommendations.push(`${failedFiles.length} files failed to process - consider using OCR`);
    }

    if (duplicateResults && duplicateResults.totalDuplicates > 0) {
      recommendations.push(`${duplicateResults.totalDuplicates} duplicates detected across files`);
    }

    if (qualityResults && qualityResults.overallScore < 80) {
      recommendations.push(`Data quality score is ${qualityResults.overallScore}% - consider data cleanup`);
    }

    const lowConfidenceFiles = processedDocuments.filter(doc => 
      doc.metadata && doc.metadata.confidence < 0.7
    );
    if (lowConfidenceFiles.length > 0) {
      recommendations.push(`${lowConfidenceFiles.length} files have low processing confidence`);
    }

    return recommendations;
  }
};
