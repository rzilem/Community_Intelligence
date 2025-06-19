
import { BaseProcessor } from './base-processor';
import { ProcessedDocument, ProcessingOptions } from '../types';
import { parseService } from '../parse-service';

export class ExcelProcessor extends BaseProcessor {
  canProcess(file: File): boolean {
    return file.type.includes('excel') || file.name.toLowerCase().match(/\.(xlsx|xls)$/);
  }

  async process(file: File, options: ProcessingOptions): Promise<ProcessedDocument> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const parsedResult = parseService.parseExcel(arrayBuffer);
      
      const doc = this.createBaseDocument(file, 'excel', JSON.stringify(parsedResult.data), parsedResult.data);
      doc.extractedData = { headers: parsedResult.headers };
      
      return doc;
    } catch (error) {
      throw new Error(`Excel processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  protected getProcessorName(): string {
    return 'excel-processor';
  }
}
