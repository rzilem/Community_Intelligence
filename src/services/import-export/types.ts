
// Main types file - unified definitions to avoid conflicts
// DO NOT import or re-export from other files to prevent circular dependencies

export interface ProcessedDocument {
  // File identification
  id?: string;
  filename: string;
  format: string;
  
  // Core data
  data: any;
  content: string;
  extractedData?: any;
  
  // Document metadata
  metadata: {
    documentType?: string;
    extractedFields?: Record<string, any>;
    dateExtracted?: Date;
    confidence?: number;
    processingMethod?: string;
    extractionMethod?: string;
    qualityScore?: number;
    tables?: number;
    forms?: number;
    processingTime?: number;
    originalName?: string;
    mimeType?: string;
    size?: number;
    pageCount?: number;
    addressEnrichment?: any;
    mlLearningData?: any;
    sandboxResults?: any;
    businessIntelligence?: any;
    [key: string]: any;
  };
  
  // Classification information
  classification: {
    type: string;
    confidence: number;
    categories?: string[];
    suggestedMapping?: Record<string, any>;
    category?: string;
    metadata?: Record<string, any>;
  };
  
  // OCR-specific data (optional, only for scanned documents)
  ocr?: {
    text: string;
    confidence: number;
    language?: string;
    pages?: Array<{
      pageNumber: number;
      text: string;
      boundingBoxes?: any[];
      lines?: Array<{
        text: string;
        boundingBox: number[];
        words: Array<{
          text: string;
          boundingBox: number[];
          confidence: number;
        }>;
      }>;
    }>;
  };
  
  // Additional processing properties
  createdAt?: Date;
  updatedAt?: Date;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  errors?: string[];
}

export interface AdvancedOCRResult {
  text: string;
  confidence: number;
  language: string;
  pages: Array<{
    pageNumber: number;
    text: string;
    lines: Array<{
      text: string;
      boundingBox: number[];
      words: Array<{
        text: string;
        boundingBox: number[];
        confidence: number;
      }>;
    }>;
  }>;
  tables?: Array<{ rows: string[][]; confidence: number }>;
  forms?: Array<{ fields: Record<string, string>; confidence: number }>;
  metadata?: {
    processingTime: number;
    ocrEngine: string;
    [key: string]: any;
  };
}

export interface OCROptions {
  languages?: string[];
  enableTableDetection?: boolean;
  enableFormDetection?: boolean;
  enhanceImage?: boolean;
  confidenceThreshold?: number;
}

export interface DocumentProcessingOptions {
  enableOCR?: boolean;
  extractMetadata?: boolean;
  classify?: boolean;
  format?: 'pdf' | 'excel' | 'word' | 'csv' | 'json' | 'image';
}

export interface ProcessingResult {
  success: boolean;
  document?: ProcessedDocument;
  error?: string;
  warnings?: string[];
}

export interface ClassificationResult {
  type: string;
  confidence: number;
  categories?: string[];
  suggestedMapping?: Record<string, any>;
  category?: string;
  metadata?: Record<string, any>;
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
  enableAddressEnrichment?: boolean;
  enableMLLearning?: boolean;
  collectUserFeedback?: boolean;
  enableSandboxMode?: boolean;
  createRollbackPoints?: boolean;
  enableBusinessIntelligence?: boolean;
  generatePredictiveInsights?: boolean;
}

// Enhanced Processing Options (extends ProcessingOptions)
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

// ML and AI types
export interface MLFeedback {
  documentId: string;
  originalClassification: string;
  correctedClassification: string;
  userConfidence: number;
  feedbackType: 'correction' | 'confirmation';
  timestamp: string;
}

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

// Enterprise feature types
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

// Legacy types for backward compatibility
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

export interface ExportOptions {
  associationId: string;
  dataType: string;
  format?: 'csv' | 'xlsx';
}

export interface ImportOptions {
  associationId: string;
  dataType: string;
  data: any[];
  mappings: Record<string, string>;
  userId?: string;
}

export interface SmartImportOptions {
  associationId: string;
  autoImportThreshold?: number;
  skipValidation?: boolean;
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
