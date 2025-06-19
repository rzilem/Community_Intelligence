
import { devLog } from '@/utils/dev-logger';
import { multiFormatProcessor } from './multi-format-processor';
import { addressEnrichmentService } from './address-enrichment-service';
import { mlTemplateLearningService } from './ml-template-learning-service';
import { importSandboxService } from './import-sandbox-service';
import { businessIntelligenceService } from './business-intelligence-service';
import { 
  ProcessedDocument, 
  EnhancedProcessingOptions, 
  MultiFormatProcessingResult,
  MLFeedback,
  PredictiveInsight,
  SandboxResult
} from './types';

export class EnhancedMultiFormatProcessor {
  async processWithAddressIntelligence(
    files: File[], 
    options: EnhancedProcessingOptions = {}
  ): Promise<MultiFormatProcessingResult> {
    const startTime = Date.now();
    devLog.info('Starting enhanced processing with address intelligence:', files.length, 'files');

    // Phase C: Create sandbox simulation if enabled
    let sandboxResult: SandboxResult | null = null;
    if (options.enterpriseFeatures?.enableSandbox) {
      devLog.info('Creating sandbox simulation for safe processing');
      // Create a simulation based on file analysis
      const simulationData = files.map(f => ({ filename: f.name, size: f.size, type: f.type }));
      sandboxResult = await importSandboxService.createSandboxSimulation(
        simulationData,
        'document_processing',
        options.associationId || 'default'
      );
    }

    // Phase C: Create rollback point if enabled
    let rollbackId: string | null = null;
    if (options.enterpriseFeatures?.createBackups) {
      rollbackId = await importSandboxService.createRollbackPoint('enhanced_processing', {
        fileCount: files.length,
        timestamp: new Date().toISOString()
      });
    }

    try {
      // Use existing multi-format processor as base
      const baseResult = await multiFormatProcessor.processWithEnhancedAnalysis(files, options);
      
      const enhancedDocuments: ProcessedDocument[] = [];
      
      for (const doc of baseResult.processedDocuments) {
        const enhancedDoc = { ...doc };
        
        // Phase A: Address Intelligence Enhancement
        if (options.addressIntelligence?.enableValidation) {
          await this.enhanceWithAddressIntelligence(enhancedDoc, options);
        }
        
        // Phase B: ML Learning Enhancement
        if (options.mlEnhancements?.enableTemplateLearning) {
          await this.enhanceWithMLLearning(enhancedDoc, options);
        }
        
        // Phase C: Enterprise Features
        if (options.enterpriseFeatures?.enableSandbox && sandboxResult) {
          enhancedDoc.metadata.sandboxResults = {
            simulationId: sandboxResult.simulationId,
            impactAnalysis: sandboxResult.impactAnalysis,
            rollbackPoints: rollbackId ? [rollbackId] : []
          };
        }
        
        // Phase D: Business Intelligence
        if (options.businessIntelligence?.enableDashboards) {
          await this.enhanceWithBusinessIntelligence(enhancedDoc, options);
        }
        
        enhancedDocuments.push(enhancedDoc);
      }
      
      // Phase D: Generate executive insights
      let executiveInsights: any = null;
      if (options.businessIntelligence?.enablePredictiveAnalytics) {
        const metrics = await businessIntelligenceService.calculateCurrentMetrics(
          options.associationId || 'default'
        );
        executiveInsights = await businessIntelligenceService.generateExecutiveDashboard(
          options.associationId || 'default'
        );
      }
      
      const enhancedResult: MultiFormatProcessingResult = {
        ...baseResult,
        processedDocuments: enhancedDocuments,
        processingStats: {
          ...baseResult.processingStats,
          totalProcessingTime: Date.now() - startTime
        }
      };
      
      // Add enhanced recommendations
      if (executiveInsights) {
        enhancedResult.recommendations.push(...executiveInsights.recommendations);
      }
      
      devLog.info('Enhanced processing completed successfully');
      return enhancedResult;
      
    } catch (error) {
      devLog.error('Enhanced processing failed:', error);
      
      // Phase C: Execute rollback if needed
      if (rollbackId && options.enterpriseFeatures?.enableAuditTrail) {
        await importSandboxService.executeRollback(rollbackId);
      }
      
      throw error;
    }
  }

  private async enhanceWithAddressIntelligence(
    doc: ProcessedDocument, 
    options: EnhancedProcessingOptions
  ): Promise<void> {
    try {
      const addresses = this.extractAddressesFromContent(doc.content);
      
      if (addresses.length > 0) {
        const enrichmentResults = await addressEnrichmentService.enrichAddresses(addresses);
        
        // Add address enrichment to metadata
        doc.metadata.addressEnrichment = enrichmentResults;
        
        // Update extracted data with enriched addresses
        if (!doc.extractedData) doc.extractedData = {};
        doc.extractedData.enrichedAddresses = enrichmentResults;
        
        devLog.info(`Enhanced ${doc.filename} with ${enrichmentResults.length} address enrichments`);
      }
    } catch (error) {
      devLog.error('Address intelligence enhancement failed:', error);
      // Don't fail the entire process for address enhancement issues
    }
  }

  private async enhanceWithMLLearning(
    doc: ProcessedDocument, 
    options: EnhancedProcessingOptions
  ): Promise<void> {
    try {
      // Phase B: Apply ML template learning
      const mlClassification = await mlTemplateLearningService.classifyDocumentWithLearning(
        doc.content,
        doc.filename
      );
      
      // Generate predictive insights
      const insights = await mlTemplateLearningService.generatePredictiveInsights([doc]);
      
      // Add ML learning data to metadata
      doc.metadata.mlLearningData = {
        userFeedback: [], // Will be populated when user provides feedback
        predictiveInsights: insights.map(i => i.description),
        suggestedImprovements: mlClassification.learningOpportunities
      };
      
      // Update classification with ML insights
      if (doc.classification) {
        doc.classification.confidence = Math.max(
          doc.classification.confidence,
          mlClassification.confidence
        );
      }
      
      devLog.info(`Enhanced ${doc.filename} with ML learning insights`);
    } catch (error) {
      devLog.error('ML learning enhancement failed:', error);
    }
  }

  private async enhanceWithBusinessIntelligence(
    doc: ProcessedDocument, 
    options: EnhancedProcessingOptions
  ): Promise<void> {
    try {
      // Phase D: Calculate quality metrics
      const qualityMetrics = this.calculateDocumentQualityMetrics(doc);
      
      // Track real-time metrics
      await businessIntelligenceService.trackRealTimeMetrics('document_processed', {
        filename: doc.filename,
        processingTime: doc.metadata.processingTime,
        confidence: doc.metadata.confidence,
        qualityScore: doc.metadata.qualityScore
      });
      
      // Add business intelligence to metadata
      doc.metadata.businessIntelligence = {
        qualityMetrics,
        performanceStats: {
          processingEfficiency: doc.metadata.processingTime < 5000 ? 'excellent' : 'needs_optimization',
          confidenceLevel: doc.metadata.confidence || 0,
          errorProbability: this.calculateErrorProbability(doc)
        },
        predictiveAnalytics: {
          recommendations: this.generateDocumentRecommendations(doc),
          riskFactors: this.identifyDocumentRisks(doc)
        }
      };
      
      devLog.info(`Enhanced ${doc.filename} with business intelligence metrics`);
    } catch (error) {
      devLog.error('Business intelligence enhancement failed:', error);
    }
  }

  // Phase B: Collect user feedback for ML learning
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
      feedbackType: originalClassification !== correctedClassification ? 'correction' : 'confirmation',
      timestamp: new Date().toISOString()
    };
    
    await mlTemplateLearningService.collectUserFeedback(feedback);
    devLog.info('User feedback collected for ML learning');
  }

  // Phase D: Generate predictive insights
  async generatePredictiveInsights(associationId: string): Promise<PredictiveInsight[]> {
    const historicalData = businessIntelligenceService.getHistoricalMetrics(30);
    return await businessIntelligenceService.generatePredictiveAnalytics(
      historicalData,
      'month'
    ).then(result => result.forecasts.map(f => ({
      type: 'optimization' as const,
      description: `Predicted ${f.metric}: ${f.forecast}`,
      confidence: f.confidence,
      suggestedAction: 'Monitor and adjust processing parameters',
      impact: 'medium' as const
    })));
  }

  private extractAddressesFromContent(content: string): string[] {
    const addressPatterns = [
      /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Place|Pl)\s*[A-Za-z\s]*\d{5}/g,
      /\d+\s+[A-Za-z0-9\s,]+\s+[A-Z]{2}\s+\d{5}/g
    ];
    
    const addresses: string[] = [];
    
    for (const pattern of addressPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        addresses.push(...matches);
      }
    }
    
    return [...new Set(addresses)]; // Remove duplicates
  }

  private calculateDocumentQualityMetrics(doc: ProcessedDocument): any {
    return {
      completeness: doc.content.length > 100 ? 0.9 : 0.5,
      readability: doc.metadata.confidence || 0.8,
      structureQuality: doc.data.length > 0 ? 0.9 : 0.6,
      overallScore: (doc.metadata.qualityScore || 75) / 100
    };
  }

  private calculateErrorProbability(doc: ProcessedDocument): number {
    let errorProb = 0.1; // Base 10% error probability
    
    if ((doc.metadata.confidence || 0) < 0.7) errorProb += 0.2;
    if ((doc.metadata.qualityScore || 0) < 70) errorProb += 0.1;
    if (doc.content.length < 50) errorProb += 0.15;
    
    return Math.min(errorProb, 0.9); // Cap at 90%
  }

  private generateDocumentRecommendations(doc: ProcessedDocument): string[] {
    const recommendations: string[] = [];
    
    if ((doc.metadata.confidence || 0) < 0.8) {
      recommendations.push('Consider manual review due to low confidence score');
    }
    
    if (doc.content.length < 100) {
      recommendations.push('Document appears to have minimal content - verify completeness');
    }
    
    if (!doc.data || doc.data.length === 0) {
      recommendations.push('No structured data extracted - consider alternative processing methods');
    }
    
    return recommendations;
  }

  private identifyDocumentRisks(doc: ProcessedDocument): string[] {
    const risks: string[] = [];
    
    if ((doc.metadata.confidence || 0) < 0.6) {
      risks.push('Low processing confidence - high error probability');
    }
    
    if (doc.metadata.processingTime > 10000) {
      risks.push('Long processing time - may indicate complex or problematic document');
    }
    
    return risks;
  }
}

export const enhancedMultiFormatProcessor = new EnhancedMultiFormatProcessor();
