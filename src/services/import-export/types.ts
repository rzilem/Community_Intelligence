
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
