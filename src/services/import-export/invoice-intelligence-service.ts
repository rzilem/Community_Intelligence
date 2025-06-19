
import { ProcessedDocument, OCROptions } from './types';
import { advancedOCRService } from './advanced-ocr-service';

export class InvoiceIntelligenceService {
  async processInvoice(file: File): Promise<ProcessedDocument> {
    const ocrOptions: OCROptions = {
      enableTableDetection: true,
      languages: ['eng'],
      enhanceImage: true
    };

    return advancedOCRService.processDocumentWithOCR(file, ocrOptions);
  }

  async extractInvoiceData(document: ProcessedDocument): Promise<any> {
    const text = document.content;
    
    // Simple invoice data extraction
    const invoiceData = {
      vendor: this.extractVendor(text),
      amount: this.extractAmount(text),
      date: this.extractDate(text),
      invoiceNumber: this.extractInvoiceNumber(text)
    };

    return invoiceData;
  }

  private extractVendor(text: string): string | null {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    return lines.length > 0 ? lines[0].trim() : null;
  }

  private extractAmount(text: string): string | null {
    const amountMatch = text.match(/\$[\d,]+\.?\d*/);
    return amountMatch ? amountMatch[0] : null;
  }

  private extractDate(text: string): string | null {
    const dateMatch = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
    return dateMatch ? dateMatch[0] : null;
  }

  private extractInvoiceNumber(text: string): string | null {
    const invoiceMatch = text.match(/(?:invoice|inv)[\s#:]*(\w+)/i);
    return invoiceMatch ? invoiceMatch[1] : null;
  }
}

export const invoiceIntelligenceService = new InvoiceIntelligenceService();
