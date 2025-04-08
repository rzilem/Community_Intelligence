
import { ImportJob, ImportMapping, ValidationResult, ImportResult, ImportJobTable, ImportMappingTable } from '@/types/import-types';

export interface ImportOptions {
  associationId: string;
  dataType: string;
  data: any[];
  mappings: Record<string, string>;
  userId?: string;
}

export interface ExportOptions {
  associationId: string;
  dataType: string;
  format: 'csv' | 'xlsx';
  filters?: Record<string, any>;
}
