
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
