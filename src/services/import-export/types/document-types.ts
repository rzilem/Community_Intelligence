
export interface DocumentStorageResult {
  success: boolean;
  associationId: string;
  associationName: string;
  documentsImported: number;
  documentsSkipped: number;
  totalFiles: number;
  createdProperties: Array<{
    id: string;
    address: string;
    unitNumber: string;
  }>;
  createdOwners: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
  }>;
  errors: string[];
  warnings: string[];
  processingTime: number;
}

export interface ProcessingProgress {
  stage: 'analyzing' | 'creating_properties' | 'uploading' | 'complete' | 'error';
  message: string;
  progress: number;
  filesProcessed: number;
  totalFiles: number;
  unitsProcessed: number;
  totalUnits: number;
  canResume?: boolean;
}

export interface ProcessedDocument {
  // Legacy properties (keep for backward compatibility)
  id?: string;
  name?: string;
  url?: string;
  size?: number;
  type?: string;
  propertyId?: string;
  unitNumber?: string;
  category?: string;
  
  // Core document processing properties
  filename: string;
  format: string;
  data: any;
  content: string;
  
  // Additional extracted data storage
  extractedData?: {
    headers?: string[];
    text?: string;
    sheets?: any[];
    rows?: any[];
    pages?: any[];
    [key: string]: any;
  };
  
  // Document metadata
  metadata: {
    documentType?: string;
    extractedFields?: Record<string, any>;
    dateExtracted?: Date;
    confidence?: number;
    processingTime?: number;
    processingMethod?: string;
    extractionMethod?: string;
    qualityScore?: number;
    tables?: number;
    forms?: number;
    originalName?: string;
    mimeType?: string;
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
