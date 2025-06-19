import { ProcessedDocument } from '../types';

// Processing options and results
export interface EnhancedProcessingOptions {
  enableOCR?: boolean;
  enableDuplicateDetection?: boolean;
  enableQualityAssessment?: boolean;
  enableAutoFix?: boolean;
  fallbackToOCR?: boolean;
  validateData?: boolean;
  extractStructured?: boolean;
  classifyDocument?: boolean;
  ocrLanguages?: string[];
  processingQuality?: 'draft' | 'standard' | 'high';
  includeMetadata?: boolean;
  qualityThreshold?: number;
  enableAddressEnrichment?: boolean;
  enableMLLearning?: boolean;
  collectUserFeedback?: boolean;
  enableSandboxMode?: boolean;
  createRollbackPoints?: boolean;
  enableBusinessIntelligence?: boolean;
  generatePredictiveInsights?: boolean;
  associationId?: string;
  addressIntelligence?: {
    enableValidation?: boolean;
    enableGeocoding?: boolean;
    enablePropertyLookup?: boolean;
    confidenceThreshold?: number;
  };
  mlEnhancements?: {
    enableTemplateLearning?: boolean;
    enablePredictiveAnalytics?: boolean;
    collectFeedback?: boolean;
  };
  enterpriseFeatures?: {
    enableSandbox?: boolean;
    enableAuditTrail?: boolean;
    createBackups?: boolean;
    keepSandboxAfterSimulation?: boolean;
  };
  businessIntelligence?: {
    enableDashboards?: boolean;
    enablePredictiveAnalytics?: boolean;
    enablePerformanceOptimization?: boolean;
  };
}

export interface MultiFormatProcessingResult {
  success: boolean;
  processedDocuments: ProcessedDocument[];
  duplicateResults?: any;
  qualityResults?: any;
  recommendations: string[];
  errors: string[];
  warnings: string[];
  processingStats: {
    totalFiles: number;
    successfulFiles: number;
    failedFiles: number;
    totalProcessingTime: number;
  };
}
