
import { parseService } from './parse-service';
import { advancedOcrService, type AdvancedOCRResult } from './advanced-ocr-service';
import { devLog } from '@/utils/dev-logger';

export interface MultiFormatResult {
  filename: string;
  format: DocumentFormat;
  extractedData: any[];
  structuredContent?: AdvancedOCRResult;
  confidence: number;
  processingTime: number;
  metadata: {
    fileSize: number;
    pageCount?: number;
    hasTableData: boolean;
    hasFormFields: boolean;
    qualityScore?: number;
  };
}

export type DocumentFormat = 
  | 'csv' 
  | 'excel' 
  | 'pdf_text' 
  | 'pdf_image' 
  | 'image' 
  | 'word' 
  | 'unknown';

export const multiFormatProcessor = {
  async processDocument(file: File): Promise<MultiFormatResult> {
    const startTime = Date.now();
    devLog.info('Starting multi-format processing for:', file.name);
    
    try {
      const format = this.detectDocumentFormat(file);
      let extractedData: any[] = [];
      let structuredContent: AdvancedOCRResult | undefined;
      let confidence = 0;
      
      switch (format) {
        case 'csv':
          extractedData = await this.processCsvFile(file);
          confidence = 0.95; // High confidence for structured data
          break;
          
        case 'excel':
          extractedData = await this.processExcelFile(file);
          confidence = 0.9;
          break;
          
        case 'pdf_text':
          extractedData = await this.processPdfWithText(file);
          confidence = 0.8;
          break;
          
        case 'pdf_image':
        case 'image':
          const ocrResult = await this.processImageDocument(file);
          structuredContent = ocrResult;
          extractedData = this.convertOcrToStructuredData(ocrResult);
          confidence = ocrResult.qualityScore / 100;
          break;
          
        case 'word':
          extractedData = await this.processWordDocument(file);
          confidence = 0.75;
          break;
          
        default:
          throw new Error(`Unsupported document format: ${format}`);
      }
      
      const processingTime = Date.now() - startTime;
      
      const result: MultiFormatResult = {
        filename: file.name,
        format,
        extractedData,
        structuredContent,
        confidence,
        processingTime,
        metadata: {
          fileSize: file.size,
          pageCount: structuredContent?.documentLayout?.pageCount,
          hasTableData: (structuredContent?.tableData?.length || 0) > 0,
          hasFormFields: (structuredContent?.formFields?.length || 0) > 0,
          qualityScore: structuredContent?.qualityScore
        }
      };
      
      devLog.info('Multi-format processing complete:', {
        filename: file.name,
        format,
        confidence,
        processingTime,
        recordsExtracted: extractedData.length
      });
      
      return result;
      
    } catch (error) {
      devLog.error('Multi-format processing failed:', error);
      throw new Error(`Processing failed for ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  detectDocumentFormat(file: File): DocumentFormat {
    const extension = file.name.toLowerCase().split('.').pop();
    const mimeType = file.type.toLowerCase();
    
    // CSV files
    if (extension === 'csv' || mimeType.includes('csv')) {
      return 'csv';
    }
    
    // Excel files
    if (['xlsx', 'xls'].includes(extension || '') || 
        mimeType.includes('spreadsheet') || 
        mimeType.includes('excel')) {
      return 'excel';
    }
    
    // PDF files (we'll determine text vs image content during processing)
    if (extension === 'pdf' || mimeType.includes('pdf')) {
      return 'pdf_text'; // Default assumption, will be corrected if needed
    }
    
    // Word documents
    if (['docx', 'doc'].includes(extension || '') || 
        mimeType.includes('document') || 
        mimeType.includes('word')) {
      return 'word';
    }
    
    // Image files
    if (['jpg', 'jpeg', 'png', 'tiff', 'bmp', 'gif'].includes(extension || '') || 
        mimeType.includes('image')) {
      return 'image';
    }
    
    return 'unknown';
  },

  async processCsvFile(file: File): Promise<any[]> {
    try {
      const content = await this.readFileAsText(file);
      const parsed = await parseService.parseFileContent(content, file.name);
      return parsed.data;
    } catch (error) {
      devLog.error('CSV processing failed:', error);
      throw new Error(`CSV processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async processExcelFile(file: File): Promise<any[]> {
    try {
      // For now, treat Excel files as potential CSV exports
      const content = await this.readFileAsText(file);
      const parsed = await parseService.parseFileContent(content, file.name);
      return parsed.data;
    } catch (error) {
      devLog.error('Excel processing failed:', error);
      
      // Fallback: try OCR if it's an Excel file saved as image
      try {
        const ocrResult = await advancedOcrService.processDocumentAdvanced(file);
        return this.convertOcrToStructuredData(ocrResult);
      } catch (ocrError) {
        throw new Error(`Excel processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  },

  async processPdfWithText(file: File): Promise<any[]> {
    try {
      // Try to extract text-based content first
      // For now, fall back to OCR processing
      const ocrResult = await advancedOcrService.processDocumentAdvanced(file);
      return this.convertOcrToStructuredData(ocrResult);
    } catch (error) {
      devLog.error('PDF text processing failed:', error);
      throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async processImageDocument(file: File): Promise<AdvancedOCRResult> {
    try {
      return await advancedOcrService.processDocumentAdvanced(file);
    } catch (error) {
      devLog.error('Image document processing failed:', error);
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async processWordDocument(file: File): Promise<any[]> {
    try {
      // For now, try OCR processing as fallback
      const ocrResult = await advancedOcrService.processDocumentAdvanced(file);
      return this.convertOcrToStructuredData(ocrResult);
    } catch (error) {
      devLog.error('Word document processing failed:', error);
      throw new Error(`Word processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  convertOcrToStructuredData(ocrResult: AdvancedOCRResult): any[] {
    const structuredData: any[] = [];
    
    try {
      // Convert table data to structured records
      if (ocrResult.tableData && ocrResult.tableData.length > 0) {
        for (const table of ocrResult.tableData) {
          const headers = table.headers;
          
          // Skip header row and convert data rows
          for (let i = 1; i < table.rows.length; i++) {
            const row = table.rows[i];
            const record: any = {};
            
            headers.forEach((header, index) => {
              if (header && row[index] !== undefined) {
                record[header] = row[index];
              }
            });
            
            if (Object.keys(record).length > 0) {
              structuredData.push(record);
            }
          }
        }
      }
      
      // Convert form fields to structured records
      if (ocrResult.formFields && ocrResult.formFields.length > 0) {
        const formRecord: any = {};
        
        ocrResult.formFields.forEach(field => {
          if (field.fieldName && field.fieldValue) {
            formRecord[field.fieldName] = field.fieldValue;
          }
        });
        
        if (Object.keys(formRecord).length > 0) {
          structuredData.push(formRecord);
        }
      }
      
      // If no structured data found, create a text-based record
      if (structuredData.length === 0 && ocrResult.text) {
        structuredData.push({
          content: ocrResult.text,
          confidence: ocrResult.confidence,
          extracted_at: new Date().toISOString()
        });
      }
      
      devLog.info(`Converted OCR to ${structuredData.length} structured records`);
      return structuredData;
      
    } catch (error) {
      devLog.error('OCR to structured data conversion failed:', error);
      return [];
    }
  },

  async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  },

  // Validation and quality assessment
  validateExtractedData(data: any[]): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!Array.isArray(data)) {
      issues.push('Extracted data is not an array');
      return { isValid: false, issues };
    }
    
    if (data.length === 0) {
      issues.push('No data records extracted');
      return { isValid: false, issues };
    }
    
    // Check for consistent structure
    const firstRecord = data[0];
    const expectedKeys = Object.keys(firstRecord);
    
    for (let i = 1; i < data.length; i++) {
      const record = data[i];
      const recordKeys = Object.keys(record);
      
      if (recordKeys.length !== expectedKeys.length) {
        issues.push(`Record ${i + 1} has inconsistent number of fields`);
      }
      
      for (const key of expectedKeys) {
        if (!(key in record)) {
          issues.push(`Record ${i + 1} missing field: ${key}`);
        }
      }
    }
    
    // Check for empty values
    const emptyValueCount = data.reduce((count, record) => {
      return count + Object.values(record).filter(value => 
        value === null || value === undefined || value === ''
      ).length;
    }, 0);
    
    const totalValues = data.length * Object.keys(firstRecord).length;
    const emptyPercentage = (emptyValueCount / totalValues) * 100;
    
    if (emptyPercentage > 50) {
      issues.push(`High percentage of empty values: ${emptyPercentage.toFixed(1)}%`);
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
};
