
import { devLog } from '@/utils/dev-logger';
import { multiFormatProcessor } from './multi-format-processor';
import { processingPipeline } from './pipeline/processing-pipeline';
import { mlTemplateLearningService } from './ml-template-learning-service';
import { 
  ProcessedDocument, 
  MultiFormatProcessingResult, 
  EnhancedProcessingOptions,
  MLFeedback,
  PredictiveInsight
} from './types';

export type { EnhancedProcessingOptions };

export class EnhancedMultiFormatProcessor {
  async processWithAddressIntelligence(
    files: File[], 
    options: EnhancedProcessingOptions = {}
  ): Promise<MultiFormatProcessingResult> {
    const startTime = Date.now();
    devLog.info('Starting enhanced processing with address intelligence for', files.length, 'files');
    
    // First process files normally
    const baseResult = await multiFormatProcessor.processWithEnhancedAnalysis(files, options);
    
    // Execute all phases through the pipeline
    await processingPipeline.execute(baseResult.processedDocuments, options);
    
    // Update processing stats
    baseResult.processingStats.totalProcessingTime = Date.now() - startTime;
    
    devLog.info('Enhanced processing completed with all phases');
    return baseResult;
  }

  async collectUserFeedback(
    documentId: string,
    originalClassification: string,
    correctedClassification: string,
    userConfidence: number
  ): Promise<void> {
    const feedback: MLFeedback = {
      documentId,
      originalClassification,
      correctedClassification,
      userConfidence,
      feedbackType: originalClassification === correctedClassification ? 'confirmation' : 'correction',
      timestamp: new Date().toISOString()
    };
    
    await mlTemplateLearningService.collectUserFeedback(feedback);
  }

  async generatePredictiveInsights(associationId: string): Promise<PredictiveInsight[]> {
    return mlTemplateLearningService.generatePredictiveInsights([]);
  }
}

export const enhancedMultiFormatProcessor = new EnhancedMultiFormatProcessor();
