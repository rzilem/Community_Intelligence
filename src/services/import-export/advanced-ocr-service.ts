
import { devLog } from '@/utils/dev-logger';
import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';
import { ProcessedDocument, OCROptions, AdvancedOCRResult } from './types';

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
}

export interface DocumentOCRResult {
  filename: string;
  extractedText: string;
  confidence: number;
  structuredData?: any;
  documentType?: string;
}

// Export the AdvancedOCRResult interface
export type { AdvancedOCRResult };

export const advancedOCRService = {
  async processDocumentWithOCR(file: File, options: OCROptions = {}): Promise<ProcessedDocument> {
    const startTime = Date.now();
    
    try {
      devLog.info('Starting advanced OCR processing for:', file.name);
      
      // Step 1: Assess image quality
      const qualityAssessment = await this.assessImageQuality(file);
      
      if (qualityAssessment.score < 0.6) {
        devLog.warn('Poor image quality detected:', qualityAssessment);
      }
      
      // Step 2: Extract text with Tesseract
      const ocrResult = await this.extractTextWithTesseract(file, options);
      
      // Step 3: Extract tables if enabled
      let tables: any[] = [];
      if (options.enableTableExtraction) {
        tables = await this.extractTables(file);
      }
      
      // Step 4: Detect forms if enabled
      let forms: any[] = [];
      if (options.enableFormDetection) {
        forms = await this.detectForms(file);
      }
      
      // Step 5: Convert to structured data
      const structuredData = await this.convertToStructuredData(ocrResult.text, tables, forms);
      
      const processingTime = Date.now() - startTime;
      
      const result: ProcessedDocument = {
        filename: file.name,
        data: structuredData.records || [],
        format: 'ocr-processed',
        content: ocrResult.text,
        metadata: {
          processingMethod: 'advanced-ocr',
          extractionMethod: 'tesseract-enhanced',
          confidence: ocrResult.confidence,
          qualityScore: Math.round(qualityAssessment.score * 100),
          tables: tables.length,
          forms: forms.length,
          processingTime,
          originalName: file.name,
          mimeType: file.type,
          size: file.size
        },
        extractedStructures: [...tables, ...forms],
        extractedData: structuredData,
        ocr: {
          text: ocrResult.text,
          confidence: ocrResult.confidence,
          pages: ocrResult.pages
        }
      };
      
      devLog.info('Advanced OCR processing completed:', {
        filename: file.name,
        confidence: result.metadata.confidence,
        qualityScore: result.metadata.qualityScore,
        processingTime
      });
      
      return result;
    } catch (error) {
      devLog.error('Advanced OCR processing failed:', error);
      throw new Error(`Advanced OCR processing failed for ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Add the missing processDocument method for backward compatibility
  async processDocument(file: File, options?: OCROptions): Promise<ProcessedDocument> {
    return this.processDocumentWithOCR(file, options);
  },

  async assessImageQuality(file: File): Promise<{ score: number; issues: string[] }> {
    // Placeholder for image quality assessment
    // In a real implementation, this would analyze resolution, contrast, noise, etc.
    return {
      score: 0.85,
      issues: []
    };
  },

  async extractTextWithTesseract(file: File, options: OCROptions = {}): Promise<AdvancedOCRResult> {
    try {
      const languages = options.languages?.join('+') || 'eng';
      const ocrOptions = {
        logger: (m: any) => devLog.debug('Tesseract progress:', m)
      };
      
      const { data } = await Tesseract.recognize(file, languages, ocrOptions);
      
      // Process pages data with proper type handling
      const pages = [];
      if (data.text) {
        // Fix the words property issue by using proper type handling
        const wordsData = (data as any).words || [];
        pages.push({
          pageNumber: 1,
          text: data.text,
          words: wordsData.map((word: any) => ({
            text: word.text || '',
            confidence: word.confidence || 0,
            bounds: {
              x: word.bbox?.x0 || 0,
              y: word.bbox?.y0 || 0,
              width: (word.bbox?.x1 || 0) - (word.bbox?.x0 || 0),
              height: (word.bbox?.y1 || 0) - (word.bbox?.y0 || 0)
            }
          }))
        });
      }
      
      return {
        text: data.text,
        confidence: data.confidence,
        language: languages,
        pages,
        tables: [],
        forms: []
      };
    } catch (error) {
      devLog.error('Tesseract OCR failed:', error);
      throw new Error(`OCR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async extractFromPDF(file: File): Promise<{ text: string; pages: any[] }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfParse(new Uint8Array(arrayBuffer));
      
      const pages = [];
      
      // Process each page with proper type handling
      for (let i = 0; i < pdf.numpages; i++) {
        pages.push({
          pageNumber: i + 1,
          text: pdf.text,
          words: [] // PDF parsing doesn't provide word-level data by default
        });
      }
      
      return {
        text: pdf.text,
        pages
      };
    } catch (error) {
      devLog.error('PDF extraction failed:', error);
      throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async extractTables(file: File): Promise<any[]> {
    // Placeholder for table extraction logic
    // In a real implementation, this would use a table extraction library
    return [];
  },

  async detectForms(file: File): Promise<any[]> {
    // Placeholder for form detection logic
    // In a real implementation, this would detect form fields
    return [];
  },

  async convertToStructuredData(text: string, tables: any[], forms: any[]): Promise<any> {
    // Basic structured data extraction
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Try to detect if this is tabular data
    const records = [];
    
    if (tables.length > 0) {
      // Use detected tables
      for (const table of tables) {
        if (table.rows && table.rows.length > 0) {
          const headers = table.rows[0];
          for (let i = 1; i < table.rows.length; i++) {
            const row = table.rows[i];
            const record: Record<string, any> = {};
            
            for (let j = 0; j < headers.length && j < row.length; j++) {
              record[headers[j]] = row[j];
            }
            
            records.push(record);
          }
        }
      }
    } else if (forms.length > 0) {
      // Use detected form fields
      for (const form of forms) {
        if (form.fields) {
          records.push(form.fields);
        }
      }
    } else {
      // Try to extract key-value pairs
      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          
          if (key && value) {
            records.push({ [key]: value });
          }
        }
      }
    }
    
    return {
      records,
      text,
      extractionMethod: tables.length > 0 ? 'table' : forms.length > 0 ? 'form' : 'key-value'
    };
  }
};
