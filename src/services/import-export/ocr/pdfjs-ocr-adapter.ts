import { OCRAdapter } from './ocr-adapter';
import { ProcessedDocument, OCROptions } from '../types';
import { devLog } from '@/utils/dev-logger';

export class PDFJSOCRAdapter implements OCRAdapter {
  private pdfjs: any = null;

  getName(): string {
    return 'PDF.js OCR';
  }

  canProcess(file: File): boolean {
    return file.type === 'application/pdf';
  }

  async processDocument(file: File, options?: OCROptions): Promise<ProcessedDocument> {
    try {
      const pdfResult = await this.extractFromPDF(file);
      
      return {
        id: `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        filename: file.name,
        data: [],
        format: 'pdf',
        content: pdfResult.text,
        metadata: {
          processingMethod: 'pdfjs-extraction',
          extractionMethod: 'pdf-text-extraction',
          confidence: 0.9,
          qualityScore: 90,
          tables: 0,
          forms: 0,
          processingTime: 0,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          pageCount: pdfResult.pages.length
        },
        extractedData: { text: pdfResult.text },
        classification: {
          type: 'pdf',
          confidence: 0.9,
          categories: ['document']
        },
        ocr: {
          text: pdfResult.text,
          confidence: 0.9,
          pages: pdfResult.pages.map(page => ({
            ...page,
            lines: [{
              text: page.text,
              boundingBox: [0, 0, 0, 0],
              words: [{
                text: page.text,
                boundingBox: [0, 0, 0, 0],
                confidence: 0.9
              }]
            }]
          }))
        }
      };
    } catch (error) {
      devLog.error('PDF.js processing error:', error);
      throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async initPdfJs() {
    if (!this.pdfjs && typeof window !== 'undefined') {
      try {
        const pdfjsModule = await import('pdfjs-dist');
        
        if (pdfjsModule.GlobalWorkerOptions) {
          pdfjsModule.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        
        this.pdfjs = pdfjsModule;
        devLog.info('PDF.js initialized successfully');
      } catch (error) {
        devLog.error('Failed to initialize PDF.js:', error);
        this.pdfjs = null;
      }
    }
    return this.pdfjs;
  }

  private async extractFromPDF(file: File): Promise<{ text: string; pages: Array<{ pageNumber: number; text: string }> }> {
    try {
      const pdfjsLib = await this.initPdfJs();
      
      if (!pdfjsLib) {
        return { text: '', pages: [] };
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      
      let fullText = '';
      const pages: Array<{ pageNumber: number; text: string }> = [];
      const pageCount = pdfDoc.numPages;
      
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        try {
          const page = await pdfDoc.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          pages.push({
            pageNumber: pageNum,
            text: pageText
          });
          
          fullText += pageText + '\n\n';
        } catch (pageError) {
          devLog.error(`Error processing page ${pageNum}:`, pageError);
        }
      }
      
      return {
        text: fullText.trim(),
        pages
      };
    } catch (error) {
      devLog.error('PDF processing error:', error);
      return {
        text: '',
        pages: []
      };
    }
  }
}
