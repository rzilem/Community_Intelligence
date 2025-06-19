
import { BaseProcessor } from './base-processor';
import { ProcessedDocument, ProcessingOptions } from '../types';
import { advancedOCRService } from '../advanced-ocr-service';

export class ImageProcessor extends BaseProcessor {
  canProcess(file: File): boolean {
    return file.type.startsWith('image/') || !!file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/);
  }

  async process(file: File, options: ProcessingOptions): Promise<ProcessedDocument> {
    return advancedOCRService.processDocumentWithOCR(file, options.ocrOptions);
  }

  protected getProcessorName(): string {
    return 'image-processor';
  }
}
