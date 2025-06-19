
import Tesseract from 'tesseract.js';
import { OCRAdapter } from './ocr-adapter';
import { ProcessedDocument, OCROptions } from '../types';
import { devLog } from '@/utils/dev-logger';

export class TesseractOCRAdapter implements OCRAdapter {
  getName(): string {
    return 'Tesseract OCR';
  }

  canProcess(file: File): boolean {
    return file.type.startsWith('image/');
  }

  async processDocument(file: File, options?: OCROptions): Promise<ProcessedDocument> {
    try {
      devLog.info('Processing image with Tesseract OCR:', file.name);
      
      const result = await Tesseract.recognize(file, options?.languages?.[0] || 'eng', {
        logger: m => devLog.debug('Tesseract:', m)
      });
      
      return {
        id: `tesseract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        filename: file.name,
        data: [],
        format: 'image',
        content: result.data.text,
        metadata: {
          processingMethod: 'tesseract-ocr',
          extractionMethod: 'ocr',
          confidence: result.data.confidence / 100,
          qualityScore: Math.round(result.data.confidence),
          tables: 0,
          forms: 0,
          processingTime: 0,
          originalName: file.name,
          mimeType: file.type,
          size: file.size
        },
        extractedData: this.extractStructuredData(result.data.text),
        classification: {
          type: 'image',
          confidence: result.data.confidence / 100,
          categories: ['scanned-document']
        },
        ocr: {
          text: result.data.text,
          confidence: result.data.confidence / 100,
          pages: [{
            pageNumber: 1,
            text: result.data.text,
            lines: [{
              text: result.data.text,
              boundingBox: [0, 0, 0, 0],
              words: [{
                text: result.data.text,
                boundingBox: [0, 0, 0, 0],
                confidence: result.data.confidence / 100
              }]
            }]
          }]
        }
      };
    } catch (error) {
      devLog.error('Tesseract OCR processing error:', error);
      throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractStructuredData(text: string): Record<string, any> {
    const extractedData: Record<string, any> = {};
    
    // Extract emails
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const emails = text.match(emailRegex);
    if (emails) extractedData.emails = emails;
    
    // Extract phone numbers
    const phoneRegex = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}/g;
    const phones = text.match(phoneRegex);
    if (phones) extractedData.phones = phones;
    
    // Extract dates
    const dateRegex = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g;
    const dates = text.match(dateRegex);
    if (dates) extractedData.dates = dates;
    
    // Extract amounts/currency
    const amountRegex = /\$[\d,]+\.?\d*/g;
    const amounts = text.match(amountRegex);
    if (amounts) extractedData.amounts = amounts;
    
    return extractedData;
  }
}
