
import { ProcessedDocument, OCROptions } from '../types';

export interface OCRAdapter {
  getName(): string;
  canProcess(file: File): boolean;
  processDocument(file: File, options?: OCROptions): Promise<ProcessedDocument>;
}
