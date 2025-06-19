
// Core import/export types
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
