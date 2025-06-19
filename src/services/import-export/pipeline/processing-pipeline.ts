
import { ProcessingPhase } from './processing-phase';
import { AddressIntelligencePhase } from './address-intelligence-phase';
import { MLLearningPhase } from './ml-learning-phase';
import { SandboxPhase } from './sandbox-phase';
import { BusinessIntelligencePhase } from './business-intelligence-phase';
import { ProcessedDocument, EnhancedProcessingOptions } from '../types';
import { devLog } from '@/utils/dev-logger';

export class ProcessingPipeline {
  private phases: ProcessingPhase[] = [
    new AddressIntelligencePhase(),
    new MLLearningPhase(),
    new SandboxPhase(),
    new BusinessIntelligencePhase()
  ];

  async execute(documents: ProcessedDocument[], options: EnhancedProcessingOptions): Promise<void> {
    devLog.info('Starting processing pipeline with', this.phases.length, 'phases');
    
    for (const phase of this.phases) {
      if (phase.isEnabled(options)) {
        devLog.info(`Executing ${phase.getName()} phase...`);
        await phase.execute(documents, options);
      } else {
        devLog.info(`Skipping ${phase.getName()} phase (disabled)`);
      }
    }
    
    devLog.info('Processing pipeline completed');
  }
}

export const processingPipeline = new ProcessingPipeline();
