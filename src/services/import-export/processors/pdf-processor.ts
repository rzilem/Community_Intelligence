
import { BaseProcessor } from './base-processor';
import { ProcessedDocument, ProcessingOptions } from '../types';
import { advancedOCRService } from '../advanced-ocr-service';

export class PDFProcessor extends BaseProcessor {
  canProcess(file: File): boolean {
    return file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
  }

  async process(file: File, options: ProcessingOptions): Promise<ProcessedDocument> {
    try {
      const pdfResult = await advancedOCRService.extractFromPDF(file);
      
      const doc = this.createBaseDocument(file, 'pdf', pdfResult.text);
      doc.metadata.pageCount = pdfResult.pages.length;
      doc.metadata.processingMethod = 'pdfjs-extraction';
      doc.metadata.extractionMethod = 'pdf-text-extraction';
      doc.metadata.confidence = 0.9;
      doc.metadata.qualityScore = 90;
      doc.extractedData = { text: pdfResult.text };
      doc.ocr = {
        text: pdfResult.text,
        confidence: 0.9,
        pages: pdfResult.pages
      };
      
      return doc;
    } catch (error) {
      // Fallback to OCR
      return advancedOCRService.processDocumentWithOCR(file, options.ocrOptions);
    }
  }

  protected getProcessorName(): string {
    return 'pdf-processor';
  }
}
