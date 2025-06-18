
export interface ImportResult {
  success: boolean;
  totalProcessed: number;
  successfulImports: number;
  failedImports: number;
  details: Array<{
    filename?: string;
    status: 'success' | 'error' | 'skipped';
    recordsProcessed: number;
    message: string;
  }>;
  errors: string[];
  warnings: string[];
}

// Smart import extends regular import with additional metadata
export interface SmartImportResult extends ImportResult {
  totalFiles: number;
  processedFiles: number;
  skippedFiles: number;
  totalRecords: number;
  importedRecords: number;
}
