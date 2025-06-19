
import { ProcessingPhase } from './processing-phase';
import { ProcessedDocument, EnhancedProcessingOptions } from '../types';
import { businessIntelligenceService } from '../business-intelligence-service';
import { devLog } from '@/utils/dev-logger';

export class BusinessIntelligencePhase extends ProcessingPhase {
  getName(): string {
    return 'Business Intelligence';
  }

  isEnabled(options: EnhancedProcessingOptions): boolean {
    return !!options.businessIntelligence?.enableDashboards;
  }

  async execute(documents: ProcessedDocument[], options: EnhancedProcessingOptions): Promise<void> {
    this.logPhaseStart(documents.length);
    
    try {
      const metrics = await businessIntelligenceService.generateQualityMetrics(documents);
      
      for (const doc of documents) {
        doc.metadata.businessIntelligence = {
          qualityMetrics: metrics,
          performanceStats: {
            processingTime: doc.metadata.processingTime,
            confidence: doc.metadata.confidence || 0.5,
            qualityScore: doc.metadata.qualityScore || 0
          },
          predictiveAnalytics: {
            recommendedActions: ['Review document quality', 'Validate data accuracy']
          }
        };
      }
    } catch (error) {
      devLog.error('Business intelligence failed:', error);
    }
    
    this.logPhaseComplete();
  }
}
