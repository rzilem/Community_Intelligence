
import { ProcessingPhase } from './processing-phase';
import { ProcessedDocument, EnhancedProcessingOptions } from '../types';
import { importSandboxService } from '../import-sandbox-service';
import { devLog } from '@/utils/dev-logger';

export class SandboxPhase extends ProcessingPhase {
  getName(): string {
    return 'Sandbox Simulation';
  }

  isEnabled(options: EnhancedProcessingOptions): boolean {
    return !!options.enterpriseFeatures?.enableSandbox;
  }

  async execute(documents: ProcessedDocument[], options: EnhancedProcessingOptions): Promise<void> {
    this.logPhaseStart(documents.length);
    
    try {
      const allData = documents.flatMap(doc => doc.data);
      
      if (allData.length > 0) {
        const sandboxResult = await importSandboxService.createSandboxSimulation(
          allData,
          'enhanced_import',
          options.associationId || 'unknown'
        );
        
        if (documents.length > 0) {
          documents[0].metadata.sandboxResults = {
            simulationId: sandboxResult.simulationId,
            impactAnalysis: sandboxResult.impactAnalysis,
            rollbackPoints: [sandboxResult.simulationId]
          };
        }
      }
    } catch (error) {
      devLog.error('Sandbox simulation failed:', error);
    }
    
    this.logPhaseComplete();
  }
}
