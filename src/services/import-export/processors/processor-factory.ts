
import { BaseProcessor } from './base-processor';
import { CSVProcessor } from './csv-processor';
import { ExcelProcessor } from './excel-processor';
import { PDFProcessor } from './pdf-processor';
import { ImageProcessor } from './image-processor';
import { advancedOCRService } from '../advanced-ocr-service';

export class ProcessorFactory {
  private processors: BaseProcessor[] = [
    new CSVProcessor(),
    new ExcelProcessor(),
    new PDFProcessor(),
    new ImageProcessor()
  ];

  getProcessor(file: File): BaseProcessor {
    const processor = this.processors.find(p => p.canProcess(file));
    
    if (!processor) {
      // Fallback processor for unknown file types
      return {
        canProcess: () => true,
        process: (file, options) => advancedOCRService.processDocumentWithOCR(file, options.ocrOptions),
        getProcessorName: () => 'fallback-ocr-processor'
      } as any;
    }
    
    return processor;
  }
}

export const processorFactory = new ProcessorFactory();
