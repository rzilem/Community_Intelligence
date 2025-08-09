import { OCRAdapter } from './ocr-adapter';
import { ProcessedDocument, OCROptions } from '../types';
import { devLog } from '@/utils/dev-logger';
import { createWorker } from 'tesseract.js';

export class PDFJSOCRAdapter implements OCRAdapter {
  private pdfjs: any = null;

  getName(): string {
    return 'PDF.js OCR';
  }

  canProcess(file: File): boolean {
    const name = (file.name || '').toLowerCase();
    return file.type.includes('pdf') || name.endsWith('.pdf');
  }

  async processDocument(file: File, options?: OCROptions): Promise<ProcessedDocument> {
    try {
      const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const pdfResult = await this.extractFromPDF(file, options);
      const end = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const processingTime = Math.round(end - start);
      
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
          processingTime,
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
          try {
            // Prefer locally bundled worker when available
            // Some bundlers (like Vite) can resolve this URL at build time
            const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
            pdfjsModule.GlobalWorkerOptions.workerSrc = workerUrl;
          } catch (_) {
            // Fallback to a reliable CDN
            pdfjsModule.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
          }
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

  private async extractFromPDF(file: File, options?: OCROptions): Promise<{ text: string; pages: Array<{ pageNumber: number; text: string }> }> {
    try {
      const pdfjsLib = await this.initPdfJs();
      
      if (!pdfjsLib || typeof window === 'undefined' || typeof document === 'undefined') {
        devLog.warn('PDF extraction attempted in non-browser environment or PDF.js not available');
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
          
          const pageText = (textContent.items || [])
            .map((item: any) => item.str)
            .join(' ')
            .trim();
          
          pages.push({ pageNumber: pageNum, text: pageText });
          fullText += (pageText ? pageText + '\n\n' : '');
        } catch (pageError) {
          devLog.error(`Error processing page ${pageNum}:`, pageError);
        }
      }

      const totalLength = fullText.trim().length;
      const pagesWithText = pages.filter(p => (p.text || '').length > 5).length;
      const textDensityOk = totalLength >= 80 && pagesWithText >= Math.max(1, Math.ceil(pageCount * 0.5));

      devLog.info('PDF.js extraction summary', { pageCount, totalLength, pagesWithText, textDensityOk });

      if (textDensityOk) {
        return { text: fullText.trim(), pages };
      }

      // Deep OCR fallback using Tesseract for scanned PDFs
      devLog.warn('Low text detected from PDF.js extraction; falling back to Tesseract OCR');
      const language = options?.languages?.[0] || 'eng';
      try {
        const ocrResult = await this.ocrPdfWithTesseract(pdfDoc, language);
        if ((ocrResult.text || '').trim().length > totalLength) {
          devLog.info('Tesseract OCR fallback succeeded', { ocrLength: ocrResult.text.length });
          return ocrResult;
        }
        devLog.warn('Tesseract OCR produced no additional text; returning PDF.js text');
      } catch (ocrError) {
        devLog.error('Tesseract OCR fallback failed:', ocrError);
      }

      return { text: fullText.trim(), pages };
    } catch (error) {
      devLog.error('PDF processing error:', error);
      return { text: '', pages: [] };
    }
  }

  private async ocrPdfWithTesseract(pdfDoc: any, language: string): Promise<{ text: string; pages: Array<{ pageNumber: number; text: string }> }> {
    if (typeof document === 'undefined') {
      return { text: '', pages: [] };
    }

    const worker = await createWorker();
    try {
      await worker.loadLanguage(language);
      await worker.initialize(language);

      let fullText = '';
      const pages: Array<{ pageNumber: number; text: string }> = [];

      const pageCount = pdfDoc.numPages;
      const maxPages = Math.min(pageCount, 10);

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2 });

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          canvas.width = viewport.width as number;
          canvas.height = viewport.height as number;

          await page.render({ canvasContext: ctx as any, viewport }).promise;
          const dataUrl = canvas.toDataURL('image/png');

          const { data } = await worker.recognize(dataUrl);
          const pageText = (data?.text || '').trim();

          pages.push({ pageNumber, text: pageText });
          fullText += (pageText ? pageText + '\n\n' : '');
        } catch (pageErr) {
          devLog.error(`Tesseract OCR error on page ${pageNum}:`, pageErr);
        }
      }

      return { text: fullText.trim(), pages };
    } finally {
      try { await worker.terminate(); } catch (_) {}
    }
  }
}
