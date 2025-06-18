
import Tesseract from 'tesseract.js';
import { devLog } from '@/utils/dev-logger';

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

export const ocrService = {
  async extractTextFromImage(imageFile: File | Blob, filename: string): Promise<OCRResult> {
    try {
      devLog.info('Starting OCR extraction for:', filename);
      
      const { data } = await Tesseract.recognize(imageFile, 'eng', {
        logger: m => devLog.debug('Tesseract progress:', m)
      });
      
      const result: OCRResult = {
        text: data.text,
        confidence: data.confidence,
        words: data.words?.map(word => ({
          text: word.text,
          confidence: word.confidence,
          bbox: word.bbox
        })) || []
      };
      
      devLog.info('OCR extraction completed:', {
        filename,
        textLength: result.text.length,
        confidence: result.confidence,
        wordCount: result.words.length
      });
      
      return result;
    } catch (error) {
      devLog.error('OCR extraction failed:', error);
      throw new Error(`OCR extraction failed for ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async processDocumentOCR(file: File): Promise<DocumentOCRResult> {
    try {
      const ocrResult = await this.extractTextFromImage(file, file.name);
      
      const documentType = this.detectDocumentType(ocrResult.text);
      const structuredData = this.extractStructuredData(ocrResult.text, documentType);
      
      return {
        filename: file.name,
        extractedText: ocrResult.text,
        confidence: ocrResult.confidence,
        structuredData,
        documentType
      };
    } catch (error) {
      devLog.error('Document OCR processing failed:', error);
      throw error;
    }
  },

  detectDocumentType(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('invoice') || lowerText.includes('bill') || lowerText.includes('amount due')) {
      return 'invoice';
    }
    
    if (lowerText.includes('property') && (lowerText.includes('address') || lowerText.includes('unit'))) {
      return 'property_list';
    }
    
    if (lowerText.includes('balance') && (lowerText.includes('statement') || lowerText.includes('account'))) {
      return 'financial_statement';
    }
    
    if (lowerText.includes('assessment') || lowerText.includes('dues') || lowerText.includes('hoa fee')) {
      return 'assessment';
    }
    
    if (lowerText.includes('owner') || lowerText.includes('resident') || lowerText.includes('tenant')) {
      return 'owner_list';
    }
    
    return 'unknown';
  },

  extractStructuredData(text: string, documentType: string): any {
    switch (documentType) {
      case 'invoice':
        return this.extractInvoiceData(text);
      case 'property_list':
        return this.extractPropertyData(text);
      case 'financial_statement':
        return this.extractFinancialData(text);
      case 'assessment':
        return this.extractAssessmentData(text);
      case 'owner_list':
        return this.extractOwnerData(text);
      default:
        return this.extractGenericData(text);
    }
  },

  extractInvoiceData(text: string): any {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const invoiceData: any = {
      vendor: null,
      invoiceNumber: null,
      date: null,
      amount: null,
      lineItems: []
    };
    
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      if (lines[i].length > 3 && !lines[i].match(/^\d+/) && !lines[i].toLowerCase().includes('invoice')) {
        invoiceData.vendor = lines[i];
        break;
      }
    }
    
    const invoiceNumMatch = text.match(/(?:invoice|inv)[\s#:]*(\w+)/i);
    if (invoiceNumMatch) {
      invoiceData.invoiceNumber = invoiceNumMatch[1];
    }
    
    const dateMatch = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
    if (dateMatch) {
      invoiceData.date = dateMatch[0];
    }
    
    const amountMatches = text.match(/\$[\d,]+\.?\d*/g);
    if (amountMatches && amountMatches.length > 0) {
      invoiceData.amount = amountMatches[amountMatches.length - 1];
    }
    
    return invoiceData;
  },

  extractPropertyData(text: string): any {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const properties = [];
    
    for (const line of lines) {
      if (line.match(/\d+\s+\w+.*(?:st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|ct|court|ln|lane|way|pl|place)/i)) {
        properties.push({
          address: line,
          unit: this.extractUnitNumber(line)
        });
      }
    }
    
    return { properties };
  },

  extractFinancialData(text: string): any {
    const amounts = text.match(/\$[\d,]+\.?\d*/g) || [];
    const dates = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g) || [];
    
    return {
      amounts: amounts.map(amount => amount.replace('$', '').replace(',', '')),
      dates,
      balanceAmount: amounts.length > 0 ? amounts[amounts.length - 1] : null
    };
  },

  extractAssessmentData(text: string): any {
    const amounts = text.match(/\$[\d,]+\.?\d*/g) || [];
    const dates = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g) || [];
    
    return {
      assessmentAmount: amounts.length > 0 ? amounts[0] : null,
      dueDate: dates.length > 0 ? dates[0] : null,
      amounts,
      dates
    };
  },

  extractOwnerData(text: string): any {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const owners = [];
    
    for (const line of lines) {
      if (line.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+/)) {
        owners.push({
          name: line,
          email: this.extractEmail(line),
          phone: this.extractPhone(line)
        });
      }
    }
    
    return { owners };
  },

  extractGenericData(text: string): any {
    const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const phones = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
    const amounts = text.match(/\$[\d,]+\.?\d*/g) || [];
    const dates = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g) || [];
    
    return {
      emails,
      phones,
      amounts,
      dates,
      textLength: text.length
    };
  },

  extractUnitNumber(text: string): string | null {
    const unitMatch = text.match(/(?:unit|apt|#)\s*(\w+)/i);
    return unitMatch ? unitMatch[1] : null;
  },

  extractEmail(text: string): string | null {
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return emailMatch ? emailMatch[0] : null;
  },

  extractPhone(text: string): string | null {
    const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    return phoneMatch ? phoneMatch[0] : null;
  }
};
