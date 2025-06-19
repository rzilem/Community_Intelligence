
import { ProcessedDocument, ProcessingOptions } from '../types';

export abstract class BaseProcessor {
  abstract canProcess(file: File): boolean;
  abstract process(file: File, options: ProcessingOptions): Promise<ProcessedDocument>;
  
  protected createBaseDocument(file: File, format: string, content: string, data: any[] = []): ProcessedDocument {
    return {
      id: `${format}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      filename: file.name,
      data,
      format,
      content,
      metadata: {
        processingMethod: this.getProcessorName(),
        extractionMethod: 'direct-parse',
        confidence: 1.0,
        qualityScore: 100,
        tables: 0,
        forms: 0,
        processingTime: 0,
        originalName: file.name,
        mimeType: file.type,
        size: file.size
      }
    };
  }
  
  protected abstract getProcessorName(): string;
}
