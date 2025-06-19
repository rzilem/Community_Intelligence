
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
