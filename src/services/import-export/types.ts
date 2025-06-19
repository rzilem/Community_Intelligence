
// Import/Export Service Types

export interface ZipFileEntry {
  filename: string;
  data: Uint8Array;
  isDirectory: boolean;
  processingErrors?: string[];
  processingWarnings?: string[];
}

export interface ParsedData {
  data: any[];
  headers: string[];
  metadata?: {
    sheetName?: string;
    rowCount?: number;
    columnCount?: number;
  };
}

export interface ProcessingResult {
  success: boolean;
  data?: any[];
  errors: string[];
  warnings: string[];
  metadata?: any;
}

export interface ValidationConfig {
  required_fields?: string[];
  optional_fields?: string[];
  data_types?: Record<string, string>;
  custom_validators?: Array<(data: any) => { valid: boolean; message?: string }>;
}

export interface MappingConfig {
  field_mappings: Record<string, string>;
  default_values?: Record<string, any>;
  transformations?: Record<string, (value: any) => any>;
}

// Export options interface
export interface ExportOptions {
  associationId: string;
  dataType: string;
  format?: 'csv' | 'xlsx';
}

// Import options interface
export interface ImportOptions {
  associationId: string;
  dataType: string;
  data: any[];
  mappings: Record<string, string>;
  userId?: string;
}

// Smart import options
export interface SmartImportOptions {
  associationId: string;
  autoImportThreshold?: number;
  skipValidation?: boolean;
}

// Address enrichment result interface
export interface AddressEnrichmentResult {
  originalAddress: string;
  enrichedData: {
    validatedAddress?: any;
    coordinates?: { latitude: number; longitude: number };
    propertyInfo?: {
      county: string;
      estimatedValue?: number;
      propertyType?: string;
    };
    confidence: number;
  };
  issues: string[];
  suggestions: string[];
}

// ML learning feedback interface
export interface MLFeedback {
  documentId: string;
  originalClassification: string;
  correctedClassification: string;
  userConfidence: number;
  feedbackType: 'correction' | 'confirmation';
  timestamp: string;
}

// Enhanced types for advanced processing
export interface ProcessedDocument {
  filename: string;
  data: any[];
  format: string;
  content: string;
  metadata: {
    pageCount?: number;
    processingMethod: string;
    extractionMethod?: string;
    confidence?: number;
    qualityScore?: number;
    tables?: number;
    forms?: number;
    processingTime: number;
    originalName: string;
    mimeType: string;
    size: number;
    // Phase A: Address Intelligence
    addressEnrichment?: AddressEnrichmentResult[];
    // Phase B: ML Enhancements
    mlLearningData?: {
      userFeedback?: MLFeedback[];
      predictiveInsights?: string[];
      suggestedImprovements?: string[];
    };
    // Phase C: Enterprise Features
    sandboxResults?: {
      simulationId: string;
      impactAnalysis: any;
      rollbackPoints: string[];
    };
    // Phase D: Business Intelligence
    businessIntelligence?: {
      qualityMetrics: any;
      performanceStats: any;
      predictiveAnalytics: any;
    };
  };
  classification?: DocumentClassification;
  extractedStructures?: any[];
  extractedData?: Record<string, any>;
  validationResults?: any;
  ocr?: {
    text: string;
    confidence: number;
    pages: any[];
  };
}

export interface DocumentClassification {
  type: string;
  confidence: number;
  suggestedMapping?: Record<string, string>;
  category?: string;
  metadata?: any;
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

export interface DetailedValidationResult {
  valid: boolean;
  score: number;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warnings: number;
  issues: Array<{
    row: number;
    field: string;
    issue: string;
    severity: 'error' | 'warning';
  }>;
  qualityMetrics: {
    completeness: number;
    consistency: number;
    accuracy: number;
  };
}

// OCR specific types
export interface OCROptions {
  enableTableExtraction?: boolean;
  enableFormDetection?: boolean;
  enableLayoutAnalysis?: boolean;
  languages?: string[];
  quality?: 'fast' | 'accurate';
}

export interface ProcessingOptions {
  enableOCR?: boolean;
  enableDuplicateDetection?: boolean;
  enableQualityAssessment?: boolean;
  enableAutoFix?: boolean;
  fallbackToOCR?: boolean;
  ocrOptions?: OCROptions;
  validateData?: boolean;
  extractStructured?: boolean;
  classifyDocument?: boolean;
  ocrLanguages?: string[];
  processingQuality?: 'draft' | 'standard' | 'high';
  includeMetadata?: boolean;
  qualityThreshold?: number;
  // Phase A: Address Intelligence
  enableAddressEnrichment?: boolean;
  // Phase B: ML Learning
  enableMLLearning?: boolean;
  collectUserFeedback?: boolean;
  // Phase C: Enterprise Features
  enableSandboxMode?: boolean;
  createRollbackPoints?: boolean;
  // Phase D: Business Intelligence
  enableBusinessIntelligence?: boolean;
  generatePredictiveInsights?: boolean;
}

// Enhanced processing options for address intelligence
export interface EnhancedProcessingOptions extends ProcessingOptions {
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
  };
  businessIntelligence?: {
    enableDashboards?: boolean;
    enablePredictiveAnalytics?: boolean;
    enablePerformanceOptimization?: boolean;
  };
}

// Advanced OCR Result interface
export interface AdvancedOCRResult {
  text: string;
  confidence: number;
  language: string;
  pages: Array<{
    pageNumber: number;
    text: string;
    words: Array<{
      text: string;
      confidence: number;
      bounds: { x: number; y: number; width: number; height: number };
    }>;
  }>;
  tables: Array<{
    rows: string[][];
    confidence: number;
  }>;
  forms: Array<{
    fields: Record<string, string>;
    confidence: number;
  }>;
}

// Classification Result interface
export interface ClassificationResult {
  type: string;
  confidence: number;
  suggestedMapping?: Record<string, string>;
  category?: string;
  metadata?: any;
}

// Phase B: ML Learning Types
export interface MLTemplatePattern {
  id: string;
  documentType: string;
  pattern: any;
  confidence: number;
  learnedFrom: string[];
  lastUpdated: string;
}

export interface PredictiveInsight {
  type: 'error_prevention' | 'optimization' | 'quality_improvement';
  description: string;
  confidence: number;
  suggestedAction: string;
  impact: 'low' | 'medium' | 'high';
}

// Phase C: Enterprise Types
export interface SandboxResult {
  simulationId: string;
  impactAnalysis: {
    recordsAffected: number;
    changesPreview: any[];
    riskAssessment: string;
    estimatedTime: number;
  };
  rollbackPlan: {
    steps: string[];
    estimatedRestoreTime: number;
    backupLocation: string;
  };
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  operation: string;
  user: string;
  details: any;
  rollbackData: any;
}

// Phase D: Business Intelligence Types
export interface BusinessIntelligenceMetrics {
  dataQuality: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
  };
  performance: {
    processingSpeed: number;
    errorRate: number;
    userSatisfaction: number;
  };
  predictive: {
    trends: any[];
    forecasts: any[];
    recommendations: string[];
  };
}
