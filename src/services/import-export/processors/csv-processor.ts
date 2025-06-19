
import { BaseProcessor } from './base-processor';
import { ProcessedDocument, ProcessingOptions } from '../types';
import { parseService } from '../parse-service';

export class CSVProcessor extends BaseProcessor {
  canProcess(file: File): boolean {
    return file.type.includes('csv') || file.name.toLowerCase().endsWith('.csv');
  }

  async process(file: File, options: ProcessingOptions): Promise<ProcessedDocument> {
    try {
      const text = await file.text();
      const parsedData = parseService.parseCSV(text);
      
      const doc = this.createBaseDocument(file, 'csv', text, parsedData);
      doc.extractedData = { headers: parsedData.length > 0 ? Object.keys(parsedData[0]) : [] };
      
      return doc;
    } catch (error) {
      throw new Error(`CSV processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  protected getProcessorName(): string {
    return 'csv-processor';
  }
}
