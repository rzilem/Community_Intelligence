import { devLog } from '@/utils/dev-logger';
import { multiFormatProcessor } from './multi-format-processor';
import { addressEnrichmentService } from './address-enrichment-service';
import { mlTemplateLearningService } from './ml-template-learning-service';
import { importSandboxService } from './import-sandbox-service';
import { businessIntelligenceService } from './business-intelligence-service';
import { 
  ProcessedDocument, 
  MultiFormatProcessingResult, 
  EnhancedProcessingOptions,
  MLFeedback,
  PredictiveInsight
} from './types';

// Export the EnhancedProcessingOptions type using 'export type'
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
    
    // Phase A: Address Intelligence Enhancement
    if (options.addressIntelligence?.enableValidation) {
      devLog.info('Applying address intelligence...');
      await this.applyAddressIntelligence(baseResult.processedDocuments, options.associationId);
    }
    
    // Phase B: ML Learning Enhancement
    if (options.mlEnhancements?.enableTemplateLearning) {
      devLog.info('Applying ML learning enhancements...');
      await this.applyMLLearning(baseResult.processedDocuments, options.associationId);
    }
    
    // Phase C: Enterprise Features (Sandbox)
    if (options.enterpriseFeatures?.enableSandbox) {
      devLog.info('Creating sandbox simulation...');
      await this.applySandboxSimulation(baseResult.processedDocuments, options.associationId);
    }
    
    // Phase D: Business Intelligence
    if (options.businessIntelligence?.enableDashboards) {
      devLog.info('Generating business intelligence metrics...');
      await this.applyBusinessIntelligence(baseResult.processedDocuments, options.associationId);
    }
    
    // Update processing stats
    baseResult.processingStats.totalProcessingTime = Date.now() - startTime;
    
    devLog.info('Enhanced processing completed with all phases');
    return baseResult;
  }

  private async applyAddressIntelligence(documents: ProcessedDocument[], associationId?: string): Promise<void> {
    for (const doc of documents) {
      try {
        // Extract addresses from document content
        const addresses = this.extractAddressesFromContent(doc.content);
        
        if (addresses.length > 0) {
          devLog.info(`Found ${addresses.length} addresses in ${doc.filename}`);
          
          // Enrich addresses
          const enrichmentResults = await addressEnrichmentService.enrichAddresses(addresses);
          
          // Store results in document metadata
          doc.metadata.addressEnrichment = enrichmentResults;
          
          // Add recommendations based on enrichment
          if (enrichmentResults.some(r => r.issues.length > 0)) {
            doc.metadata.addressEnrichment.push({
              originalAddress: 'SYSTEM_RECOMMENDATION',
              enrichedData: { confidence: 1.0 },
              issues: [],
              suggestions: ['Some addresses require manual review for accuracy']
            });
          }
        }
      } catch (error) {
        devLog.error('Address intelligence failed for document:', doc.filename, error);
      }
    }
  }

  private async applyMLLearning(documents: ProcessedDocument[], associationId?: string): Promise<void> {
    for (const doc of documents) {
      try {
        // Apply ML classification with learning
        const learningResult = await mlTemplateLearningService.classifyDocumentWithLearning(
          doc.content, 
          doc.filename
        );
        
        // Store ML learning data
        doc.metadata.mlLearningData = {
          predictiveInsights: learningResult.learningOpportunities,
          suggestedImprovements: [
            `Classification confidence: ${(learningResult.confidence * 100).toFixed(1)}%`,
            `Document type: ${learningResult.classification}`
          ]
        };
        
        // Update document classification if ML has higher confidence
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
  }

  private async applySandboxSimulation(documents: ProcessedDocument[], associationId?: string): Promise<void> {
    try {
      // Create sandbox simulation for all processed data
      const allData = documents.flatMap(doc => doc.data);
      
      if (allData.length > 0) {
        const sandboxResult = await importSandboxService.createSandboxSimulation(
          allData,
          'enhanced_import',
          associationId || 'unknown'
        );
        
        // Store sandbox results in the first document (or create summary document)
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
  }

  private async applyBusinessIntelligence(documents: ProcessedDocument[], associationId?: string): Promise<void> {
    try {
      // Generate business intelligence metrics
      const metrics = await businessIntelligenceService.generateQualityMetrics(documents);
      
      // Apply to each document
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
  }

  private extractAddressesFromContent(content: string): string[] {
    const addresses: string[] = [];
    
    // Simple address pattern matching
    const addressPatterns = [
      /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Way|Court|Ct)\b/gi,
      /\b\d+\s+[A-Za-z\s]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Way|Court|Ct)\s*,?\s*[A-Za-z\s]+\s*,?\s*[A-Z]{2}\s*\d{5}/gi
    ];
    
    for (const pattern of addressPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        addresses.push(...matches);
      }
    }
    
    // Remove duplicates
    return [...new Set(addresses)];
  }

  // Phase B: User feedback collection
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

  // Phase B: Generate predictive insights
  async generatePredictiveInsights(associationId: string): Promise<PredictiveInsight[]> {
    return mlTemplateLearningService.generatePredictiveInsights([]);
  }
}

export const enhancedMultiFormatProcessor = new EnhancedMultiFormatProcessor();
