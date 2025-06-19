
// Document-related types
export interface DocumentClassification {
  type: string;
  confidence: number;
  suggestedMapping?: Record<string, string>;
  category?: string;
  metadata?: any;
}

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
    addressEnrichment?: AddressEnrichmentResult[];
    mlLearningData?: {
      userFeedback?: MLFeedback[];
      predictiveInsights?: string[];
      suggestedImprovements?: string[];
    };
    sandboxResults?: {
      simulationId: string;
      impactAnalysis: any;
      rollbackPoints: string[];
    };
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

export interface ClassificationResult {
  type: string;
  confidence: number;
  suggestedMapping?: Record<string, string>;
  category?: string;
  metadata?: any;
}

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
