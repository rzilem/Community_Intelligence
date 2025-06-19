
import { OCRAdapter } from './ocr/ocr-adapter';
import { TesseractOCRAdapter } from './ocr/tesseract-ocr-adapter';
import { PDFJSOCRAdapter } from './ocr/pdfjs-ocr-adapter';
import { ProcessedDocument, OCROptions, AdvancedOCRResult } from './types';

export class AdvancedOCRService {
  private adapters: OCRAdapter[] = [
    new PDFJSOCRAdapter(),
    new TesseractOCRAdapter()
  ];

  async processDocument(file: File, options?: OCROptions): Promise<ProcessedDocument> {
    return this.processDocumentWithOCR(file, options);
  }

  async processDocumentWithOCR(file: File, options?: OCROptions): Promise<ProcessedDocument> {
    const adapter = this.getAdapter(file);
    return adapter.processDocument(file, options);
  }

  async extractFromPDF(file: File): Promise<{ text: string; pages: Array<{ pageNumber: number; text: string }> }> {
    const pdfAdapter = this.adapters.find(adapter => adapter.getName() === 'PDF.js OCR') as PDFJSOCRAdapter;
    
    if (!pdfAdapter) {
      return { text: '', pages: [] };
    }
    
    try {
      const result = await pdfAdapter.processDocument(file);
      return {
        text: result.content,
        pages: result.ocr?.pages?.map(page => ({
          pageNumber: page.pageNumber,
          text: page.text
        })) || []
      };
    } catch (error) {
      return { text: '', pages: [] };
    }
  }

  private getAdapter(file: File): OCRAdapter {
    const adapter = this.adapters.find(a => a.canProcess(file));
    
    if (!adapter) {
      // Fallback to Tesseract for unknown types
      return new TesseractOCRAdapter();
    }
    
    return adapter;
  }

  // Legacy compatibility methods
  async assessImageQuality(file: File): Promise<{ quality: 'high' | 'medium' | 'low'; suggestions: string[] }> {
    return { quality: 'medium', suggestions: [] };
  }

  async detectDocumentLanguage(text: string): Promise<string> {
    return 'eng';
  }

  async extractTables(file: File): Promise<Array<{ rows: string[][]; confidence: number }>> {
    return [];
  }

  async extractForms(file: File): Promise<Array<{ fields: Record<string, string>; confidence: number }>> {
    return [];
  }

  async enhanceImage(file: File): Promise<Blob> {
    return file;
  }

  async processMultiPageDocument(file: File, options?: OCROptions): Promise<AdvancedOCRResult> {
    const processedDoc = await this.processDocumentWithOCR(file, options);
    
    return {
      text: processedDoc.content,
      confidence: processedDoc.ocr?.confidence || 0.9,
      language: options?.languages?.[0] || 'eng',
      pages: processedDoc.ocr?.pages?.map(page => ({
        pageNumber: page.pageNumber,
        text: page.text,
        lines: page.lines || [{
          text: page.text,
          boundingBox: [0, 0, 0, 0],
          words: [{
            text: page.text,
            boundingBox: [0, 0, 0, 0],
            confidence: 0.9
          }]
        }]
      })) || [],
      tables: [],
      forms: []
    };
  }

  async convertToStructuredData(text: string, tables: any[], forms: any[]): Promise<Record<string, any>> {
    return { text, tables, forms };
  }
}

export const advancedOCRService = new AdvancedOCRService();
