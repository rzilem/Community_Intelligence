
// Import related types for data import/export functionality
export type ImportJob = {
  id: string;
  association_id: string;
  import_type: string;
  status: 'processing' | 'completed' | 'failed' | 'validating';
  file_name: string;
  file_size: number;
  rows_processed: number;
  rows_succeeded: number;
  rows_failed: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  error_details?: Record<string, any>;
};

export type ImportMapping = {
  id: string;
  association_id: string;
  import_type: string;
  mappings: Record<string, string>;
  created_at: string;
  updated_at: string;
  created_by?: string;
};

export type ValidationResult = {
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
};

export type ImportResult = {
  success: boolean;
  totalProcessed: number;
  successfulImports: number;
  failedImports: number;
  job_id?: string;
  details: Array<{
    status: 'success' | 'error' | 'warning';
    message: string;
  }>;
};

export type DataMappingConfig = {
  fileColumns: string[];
  systemFields: { label: string; value: string }[];
  mappings: Record<string, string>;
};
