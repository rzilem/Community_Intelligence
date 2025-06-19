
import { ProcessingPhase } from './processing-phase';
import { ProcessedDocument, EnhancedProcessingOptions } from '../types';
import { enhancedMLService } from '../enhanced-ml-service';
import { devLog } from '@/utils/dev-logger';

export class MLLearningPhase extends ProcessingPhase {
  getName(): string {
    return 'Advanced ML Learning';
  }

  isEnabled(options: EnhancedProcessingOptions): boolean {
    return !!options.mlEnhancements?.enableTemplateLearning;
  }

  async execute(documents: ProcessedDocument[], options: EnhancedProcessingOptions): Promise<void> {
    this.logPhaseStart(documents.length);
    
    for (const doc of documents) {
      try {
        // Use enhanced ML service for document analysis
        const analysis = await enhancedMLService.analyzeDocument(doc.content, doc.filename);
        
        // Update document with ML analysis results
        doc.classification = {
          type: analysis.classification,
          confidence: analysis.confidence,
          suggestedMapping: analysis.suggestedMappings,
          category: 'ml_classified',
          metadata: {
            qualityScore: analysis.qualityScore,
            extractedData: analysis.extractedData
          }
        };
        
        // Add ML learning data to metadata
        doc.metadata.mlLearningData = {
          predictiveInsights: analysis.suggestions,
          suggestedImprovements: [
            `Classification confidence: ${(analysis.confidence * 100).toFixed(1)}%`,
            `Document type: ${analysis.classification}`,
            `Quality score: ${analysis.qualityScore}/100`
          ]
        };
        
        // Add any issues found during analysis
        if (analysis.issues.length > 0) {
          doc.metadata.mlLearningData.suggestedImprovements.push(
            ...analysis.issues.map(issue => `Issue: ${issue}`)
          );
        }
        
        // Generate field mapping suggestions based on ML analysis
        if (Object.keys(analysis.suggestedMappings).length > 0) {
          doc.metadata.mlLearningData.predictiveInsights.push(
            'ML-powered field mapping suggestions available'
          );
        }
        
        devLog.info(`ML analysis completed for ${doc.filename}:`, {
          classification: analysis.classification,
          confidence: analysis.confidence,
          qualityScore: analysis.qualityScore
        });
        
      } catch (error) {
        devLog.error('ML learning failed for document:', doc.filename, error);
        
        // Add fallback ML data
        doc.metadata.mlLearningData = {
          predictiveInsights: [],
          suggestedImprovements: [`ML analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
        };
      }
    }
    
    // Generate predictive insights across all documents
    try {
      const allDocumentData = documents.map(doc => ({
        filename: doc.filename,
        classification: doc.classification?.type || 'unknown',
        confidence: doc.classification?.confidence || 0,
        qualityScore: doc.metadata.qualityScore || 50
      }));
      
      const globalInsights = await enhancedMLService.generatePredictiveInsights(allDocumentData);
      
      // Add global insights to the first document (will be available in results)
      if (documents.length > 0 && globalInsights.length > 0) {
        if (!documents[0].metadata.mlLearningData) {
          documents[0].metadata.mlLearningData = { predictiveInsights: [], suggestedImprovements: [] };
        }
        
        documents[0].metadata.mlLearningData.predictiveInsights.push(
          ...globalInsights.map(insight => 
            `${insight.type}: ${insight.description} (Confidence: ${(insight.confidence * 100).toFixed(0)}%)`
          )
        );
      }
      
    } catch (error) {
      devLog.error('Global predictive insights generation failed:', error);
    }
    
    this.logPhaseComplete();
  }
}
