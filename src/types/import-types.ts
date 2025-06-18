
// Core import result types
export interface ImportResult {
  success: boolean;
  totalProcessed: number;
  successfulImports: number;
  failedImports: number;
  details: Array<{
    filename?: string;
    status: 'success' | 'error' | 'skipped' | 'warning';
    recordsProcessed: number;
    message: string;
  }>;
  errors: string[];
  warnings: string[];
  job_id?: string;
}

// Smart import extends regular import with additional metadata
export interface SmartImportResult extends ImportResult {
  totalFiles: number;
  processedFiles: number;
  skippedFiles: number;
  totalRecords: number;
  importedRecords: number;
}

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warnings: number;
  issues: Array<{
    row: number;
    field: string;
    issue: string;
  }>;
}

// Import options interface
export interface ImportOptions {
  associationId: string;
  dataType: string;
  data: any[];
  mappings: Record<string, string>;
  userId?: string;
}

// Export options interface
export interface ExportOptions {
  associationId: string;
  dataType: string;
  format?: 'csv' | 'xlsx';
}

// Import job interfaces
export interface ImportJob {
  id: string;
  association_id: string;
  import_type: string;
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  file_name: string;
  file_size: number;
  rows_processed?: number;
  rows_succeeded?: number;
  rows_failed?: number;
  error_details?: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type ImportJobTable = 'import_jobs';
export type ImportMappingTable = 'import_mappings';
