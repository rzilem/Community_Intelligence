
import { useState, useCallback } from 'react';
import { enhancedMultiFormatProcessor } from '@/services/import-export/enhanced-multi-format-processor';
import { businessIntelligenceService } from '@/services/import-export/business-intelligence-service';
import { toast } from 'sonner';

export interface EnhancedImportWorkflowState {
  isProcessing: boolean;
  currentStep: string;
  progress: number;
  results: {
    processedDocuments: any[];
    duplicateResults: any;
    qualityResults: any;
    recommendations: string[];
    // Phase additions
    addressIntelligence?: any[];
    mlInsights?: any[];
    sandboxResults?: any;
    businessIntelligence?: any;
  } | null;
  error: string | null;
}

export function useEnhancedImportWorkflow() {
  const [state, setState] = useState<EnhancedImportWorkflowState>({
    isProcessing: false,
    currentStep: '',
    progress: 0,
    results: null,
    error: null
  });

  const processFiles = useCallback(async (
    files: File[],
    options: {
      enableOCR?: boolean;
      enableDuplicateDetection?: boolean;
      enableQualityAssessment?: boolean;
      enableAutoFix?: boolean;
      // Phase A: Address Intelligence
      enableAddressIntelligence?: boolean;
      // Phase B: ML Learning
      enableMLLearning?: boolean;
      // Phase C: Enterprise Features
      enableSandbox?: boolean;
      enableAuditTrail?: boolean;
      // Phase D: Business Intelligence
      enableBusinessIntelligence?: boolean;
      associationId?: string;
    } = {}
  ) => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      currentStep: 'Initializing enhanced processing...',
      progress: 0,
      error: null
    }));

    try {
      // Step 1: Process files with enhanced features
      setState(prev => ({ ...prev, currentStep: 'Processing files with AI enhancement...', progress: 20 }));
      
      const enhancedOptions = {
        enableOCR: options.enableOCR,
        enableDuplicateDetection: options.enableDuplicateDetection,
        enableQualityAssessment: options.enableQualityAssessment,
        enableAutoFix: options.enableAutoFix,
        fallbackToOCR: true,
        associationId: options.associationId,
        // Phase A: Address Intelligence
        addressIntelligence: {
          enableValidation: options.enableAddressIntelligence,
          enableGeocoding: options.enableAddressIntelligence,
          enablePropertyLookup: options.enableAddressIntelligence,
          confidenceThreshold: 0.7
        },
        // Phase B: ML Enhancements
        mlEnhancements: {
          enableTemplateLearning: options.enableMLLearning,
          enablePredictiveAnalytics: options.enableMLLearning,
          collectFeedback: options.enableMLLearning
        },
        // Phase C: Enterprise Features
        enterpriseFeatures: {
          enableSandbox: options.enableSandbox,
          enableAuditTrail: options.enableAuditTrail,
          createBackups: options.enableAuditTrail
        },
        // Phase D: Business Intelligence
        businessIntelligence: {
          enableDashboards: options.enableBusinessIntelligence,
          enablePredictiveAnalytics: options.enableBusinessIntelligence,
          enablePerformanceOptimization: options.enableBusinessIntelligence
        }
      };

      setState(prev => ({ ...prev, currentStep: 'Applying address intelligence...', progress: 40 }));
      
      const results = await enhancedMultiFormatProcessor.processWithAddressIntelligence(
        files, 
        enhancedOptions
      );

      setState(prev => ({ ...prev, currentStep: 'Generating insights and recommendations...', progress: 80 }));

      // Extract enhanced data from results
      const addressIntelligence = results.processedDocuments
        .map(doc => doc.metadata.addressEnrichment)
        .filter(Boolean);

      const mlInsights = results.processedDocuments
        .map(doc => doc.metadata.mlLearningData)
        .filter(Boolean);

      const sandboxResults = results.processedDocuments
        .find(doc => doc.metadata.sandboxResults)?.metadata.sandboxResults;

      const businessIntelligence = results.processedDocuments
        .map(doc => doc.metadata.businessIntelligence)
        .filter(Boolean);

      setState(prev => ({ 
        ...prev, 
        progress: 100, 
        results: {
          processedDocuments: results.processedDocuments || [],
          duplicateResults: results.duplicateResults || null,
          qualityResults: results.qualityResults || null,
          recommendations: results.recommendations || [],
          // Enhanced results
          addressIntelligence,
          mlInsights,
          sandboxResults,
          businessIntelligence
        }
      }));
      
      toast.success(`Successfully processed ${files.length} files with enhanced AI features`);
      
      // Enhanced notifications based on new features
      if (addressIntelligence.length > 0) {
        toast.info(`Address intelligence applied to ${addressIntelligence.length} documents`);
      }
      
      if (mlInsights.length > 0) {
        toast.info(`ML insights generated for ${mlInsights.length} documents`);
      }
      
      if (sandboxResults) {
        toast.info('Sandbox simulation completed - review impact analysis');
      }
      
      if (businessIntelligence.length > 0) {
        toast.info('Business intelligence metrics generated');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
      toast.error(`Enhanced processing failed: ${errorMessage}`);
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, []);

  const collectUserFeedback = useCallback(async (
    documentId: string,
    originalClassification: string,
    correctedClassification: string,
    userConfidence: number
  ) => {
    try {
      await enhancedMultiFormatProcessor.collectUserFeedback(
        documentId,
        originalClassification,
        correctedClassification,
        userConfidence
      );
      toast.success('Feedback collected - AI will learn from this correction');
    } catch (error) {
      toast.error('Failed to collect feedback');
    }
  }, []);

  const generatePredictiveInsights = useCallback(async (associationId: string) => {
    try {
      const insights = await enhancedMultiFormatProcessor.generatePredictiveInsights(associationId);
      return insights;
    } catch (error) {
      toast.error('Failed to generate predictive insights');
      return [];
    }
  }, []);

  const getBusinessIntelligenceDashboard = useCallback(async (associationId: string) => {
    try {
      const dashboard = await businessIntelligenceService.generateExecutiveDashboard(associationId);
      return dashboard;
    } catch (error) {
      toast.error('Failed to generate business intelligence dashboard');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      currentStep: '',
      progress: 0,
      results: null,
      error: null
    });
  }, []);

  return {
    state,
    processFiles,
    collectUserFeedback,
    generatePredictiveInsights,
    getBusinessIntelligenceDashboard,
    reset
  };
}
