
import { ProcessingPhase } from './processing-phase';
import { ProcessedDocument, EnhancedProcessingOptions } from '../types';
import { mlTemplateLearningService } from '../ml-template-learning-service';
import { devLog } from '@/utils/dev-logger';

export class MLLearningPhase extends ProcessingPhase {
  getName(): string {
    return 'ML Learning';
  }

  isEnabled(options: EnhancedProcessingOptions): boolean {
    return !!options.mlEnhancements?.enableTemplateLearning;
  }

  async execute(documents: ProcessedDocument[], options: EnhancedProcessingOptions): Promise<void> {
    this.logPhaseStart(documents.length);
    
    for (const doc of documents) {
      try {
        const learningResult = await mlTemplateLearningService.classifyDocumentWithLearning(
          doc.content, 
          doc.filename
        );
        
        doc.metadata.mlLearningData = {
          predictiveInsights: learningResult.learningOpportunities,
          suggestedImprovements: [
            `Classification confidence: ${(learningResult.confidence * 100).toFixed(1)}%`,
            `Document type: ${learningResult.classification}`
          ]
        };
        
        if (learningResult.confidence > 0.8) {
          doc.classification = {
            type: learningResult.classification,
            confidence: learningResult.confidence,
            suggestedMapping: {},
            category: 'ml_classified'
          };
        }
      } catch (error) {
        devLog.error('ML learning failed for document:', doc.filename, error);
      }
    }
    
    this.logPhaseComplete();
  }
}
