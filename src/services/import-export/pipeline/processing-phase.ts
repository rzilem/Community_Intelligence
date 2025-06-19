
import { ProcessedDocument, EnhancedProcessingOptions } from '../types';

export abstract class ProcessingPhase {
  abstract getName(): string;
  abstract isEnabled(options: EnhancedProcessingOptions): boolean;
  abstract execute(documents: ProcessedDocument[], options: EnhancedProcessingOptions): Promise<void>;
  
  protected logPhaseStart(documentsCount: number): void {
    console.log(`Starting ${this.getName()} phase for ${documentsCount} documents`);
  }
  
  protected logPhaseComplete(): void {
    console.log(`${this.getName()} phase completed`);
  }
}
