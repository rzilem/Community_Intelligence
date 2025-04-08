
export interface MappingOption {
  label: string;
  value: string;
}

export interface ValidationSummary {
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

export interface MappingSuggestion {
  fieldValue: string;
  confidence: number;
}

export interface ColumnMapping {
  columnName: string;
  fieldName: string;
  suggested?: MappingSuggestion;
}
