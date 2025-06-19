
// Document processing and metadata types
export interface ProcessedDocument {
  id: string;
  filename: string;
  format: string;
  content: string;
  data: any[];
  extractedData?: any;
  classification?: DocumentClassification;
  metadata: DocumentMetadata;
  originalSize?: number;
  processingTime?: number;
  ocr?: {
    text: string;
    confidence: number;
    pages: Array<{
      pageNumber: number;
      text: string;
      words?: any[];
    }>;
  };
}

export interface DocumentClassification {
  type: string;
  confidence: number;
  suggestedMapping?: Record<string, string>;
  category?: string;
  metadata?: any;
}

export interface DocumentMetadata {
  processingTime?: number;
  confidence?: number;
  qualityScore?: number;
  issues?: string[];
  warnings?: string[];
  suggestions?: string[];
  ocrResults?: any;
  duplicateResults?: any;
  validationResults?: any;
  addressEnrichment?: AddressEnrichmentResult[];
  mlLearningData?: MLLearningData;
  sandboxResults?: SandboxResults;
  businessIntelligence?: BusinessIntelligenceData;
  
  // Additional OCR and processing metadata
  processingMethod?: string;
  extractionMethod?: string;
  pageCount?: number;
  tables?: number;
  forms?: number;
  originalName?: string;
  mimeType?: string;
  size?: number;
}

export interface AddressEnrichmentResult {
  originalAddress: string;
  enrichedData: {
    validatedAddress?: any;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    propertyInfo?: {
      county: string;
      estimatedValue: number;
      propertyType: string;
    };
    confidence: number;
  };
  issues: string[];
  suggestions: string[];
}

export interface MLLearningData {
  predictiveInsights: string[];
  suggestedImprovements: string[];
}

export interface SandboxResults {
  simulationId: string;
  impactAnalysis: {
    recordsAffected: number;
    tablesModified: string[];
    dataIntegrityIssues: string[];
    performanceMetrics: {
      processingTime: number;
      memoryUsage: number;
      queryCount: number;
    };
  };
  rollbackPoints: string[];
  changePreview?: {
    recordsAffected: number;
    tablesModified: string[];
    estimatedProcessingTime: number;
  };
  recommendations: string[];
  risks: string;
  readyForProduction: boolean;
}

export interface BusinessIntelligenceData {
  qualityMetrics: {
    overallScore: number;
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
  };
  performanceStats: {
    processingSpeed: number;
    errorRate: number;
    systemLoad: number;
    currentHealth: string;
  };
  predictiveAnalytics: {
    forecasts: any;
    risks: Array<{
      level: string;
      description: string;
    }>;
    opportunities: Array<{
      description: string;
      impact: string;
    }>;
  };
  recommendations: Array<{
    priority: string;
    category: string;
    action: string;
    benefit: string;
  }>;
  optimizationInsights?: {
    bottlenecks: string[];
    suggestedOptimizations: string[];
    projectedImprovements: any;
  };
}

// Add missing OCR and classification result types
export interface AdvancedOCRResult {
  text: string;
  confidence: number;
  language: string;
  pages: Array<{
    pageNumber: number;
    text: string;
    words?: any[];
  }>;
  tables: Array<{ rows: string[][]; confidence: number }>;
  forms: Array<{ fields: Record<string, string>; confidence: number }>;
}

export interface ClassificationResult {
  type: string;
  confidence: number;
  suggestedMapping?: Record<string, string>;
  category?: string;
  metadata?: any;
}
