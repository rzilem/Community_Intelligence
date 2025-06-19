
import { ValidationResult } from '@/types/import-types';
import { devLog } from '@/utils/dev-logger';

export interface DetailedValidationResult extends ValidationResult {
  fileSpecificIssues: Record<string, string[]>;
  suggestedFixes: string[];
  dataTypeConfidence: number;
}

export const enhancedValidationService = {
  async validateDataWithDetails(
    data: any[],
    dataType: string,
    associationId: string,
    filename?: string
  ): Promise<DetailedValidationResult> {
    try {
      devLog.info('Enhanced validation starting:', { dataType, recordCount: data.length, filename });
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        return {
          valid: false,
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
          warnings: 0,
          issues: [{ row: 0, field: 'data', issue: 'No data provided for validation' }],
          fileSpecificIssues: { [filename || 'unknown']: ['File contains no valid data'] },
          suggestedFixes: ['Check if the file format is correct', 'Ensure the file is not empty'],
          dataTypeConfidence: 0
        };
      }

      const issues: Array<{ row: number; field: string; issue: string }> = [];
      const fileSpecificIssues: Record<string, string[]> = {};
      const suggestedFixes: string[] = [];
      let validRows = 0;
      let warnings = 0;
      let dataTypeConfidence = 0;

      // Analyze data structure
      const firstRow = data[0];
      const columnNames = Object.keys(firstRow || {});
      
      devLog.info('Analyzing data structure:', { columnNames, firstRowSample: firstRow });

      // Check for common Excel issues
      if (this.hasExcelArtifacts(data)) {
        const excelIssues = this.identifyExcelIssues(data);
        fileSpecificIssues[filename || 'excel_file'] = excelIssues;
        if (excelIssues.length > 0) {
          suggestedFixes.push('Remove Excel header rows or metadata', 'Check for merged cells', 'Ensure consistent data format');
        }
      }

      // Analyze data type confidence
      dataTypeConfidence = this.calculateDataTypeConfidence(data, dataType);
      
      if (dataTypeConfidence < 0.5) {
        suggestedFixes.push(`Data structure doesn't match expected ${dataType} format`);
      }

      // Validate each row with detailed feedback
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowIssues = this.validateRowWithDetails(row, dataType, i + 1, columnNames);
        
        if (rowIssues.length === 0) {
          validRows++;
        } else {
          const criticalIssues = rowIssues.filter(issue => 
            issue.issue.includes('required') || issue.issue.includes('invalid')
          );
          const warningIssues = rowIssues.filter(issue => 
            !issue.issue.includes('required') && !issue.issue.includes('invalid')
          );
          
          warnings += warningIssues.length;
          issues.push(...rowIssues);
        }
      }

      // Generate specific fixes based on common issues
      this.addContextualSuggestions(issues, suggestedFixes, dataType);

      const invalidRows = data.length - validRows;
      const result: DetailedValidationResult = {
        valid: invalidRows === 0,
        totalRows: data.length,
        validRows,
        invalidRows,
        warnings,
        issues,
        fileSpecificIssues,
        suggestedFixes,
        dataTypeConfidence
      };

      devLog.info('Enhanced validation completed:', result);
      return result;
    } catch (error) {
      devLog.error('Enhanced validation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      
      return {
        valid: false,
        totalRows: data?.length || 0,
        validRows: 0,
        invalidRows: data?.length || 0,
        warnings: 0,
        issues: [{ row: 0, field: 'validation', issue: `Validation failed: ${errorMessage}` }],
        fileSpecificIssues: { [filename || 'unknown']: [errorMessage] },
        suggestedFixes: ['Check file format and structure', 'Ensure data is properly formatted'],
        dataTypeConfidence: 0
      };
    }
  },

  hasExcelArtifacts(data: any[]): boolean {
    if (!data || data.length === 0) return false;
    
    // Check for typical Excel issues
    const firstRow = data[0];
    const keys = Object.keys(firstRow || {});
    
    return (
      keys.some(key => key.includes('__EMPTY')) ||
      keys.some(key => key.startsWith('F') && /^\d+$/.test(key.substring(1))) ||
      data.some(row => Object.values(row).every(val => val === null || val === undefined))
    );
  },

  identifyExcelIssues(data: any[]): string[] {
    const issues: string[] = [];
    
    if (data.length === 0) {
      issues.push('File appears to be empty');
      return issues;
    }

    const firstRow = data[0];
    const keys = Object.keys(firstRow || {});
    
    if (keys.some(key => key.includes('__EMPTY'))) {
      issues.push('Excel file contains empty columns (possible merged cells)');
    }
    
    if (keys.some(key => key.startsWith('F') && /^\d+$/.test(key.substring(1)))) {
      issues.push('Excel file may have generic column names (F1, F2, etc.)');
    }
    
    const emptyRowCount = data.filter(row => 
      Object.values(row).every(val => val === null || val === undefined || val === '')
    ).length;
    
    if (emptyRowCount > data.length * 0.3) {
      issues.push(`High number of empty rows detected (${emptyRowCount}/${data.length})`);
    }

    return issues;
  },

  calculateDataTypeConfidence(data: any[], expectedType: string): number {
    if (!data || data.length === 0) return 0;
    
    const firstRow = data[0];
    const columns = Object.keys(firstRow || {});
    
    const expectedColumns = this.getExpectedColumnsForType(expectedType);
    const matchingColumns = columns.filter(col => 
      expectedColumns.some(expected => 
        col.toLowerCase().includes(expected.toLowerCase()) ||
        expected.toLowerCase().includes(col.toLowerCase())
      )
    );
    
    return expectedColumns.length > 0 ? matchingColumns.length / expectedColumns.length : 0.5;
  },

  getExpectedColumnsForType(dataType: string): string[] {
    switch (dataType) {
      case 'properties':
        return ['address', 'property_type', 'unit_number'];
      case 'owners':
        return ['first_name', 'last_name', 'email'];
      case 'properties_owners':
        return ['address', 'first_name', 'last_name'];
      case 'financial':
        return ['amount', 'due_date', 'property'];
      case 'compliance':
        return ['violation_type', 'property', 'date'];
      case 'maintenance':
        return ['title', 'description', 'property'];
      case 'associations':
        return ['name', 'address', 'contact'];
      default:
        return [];
    }
  },

  validateRowWithDetails(row: any, dataType: string, rowNumber: number, availableColumns: string[]): Array<{ row: number; field: string; issue: string }> {
    const issues: Array<{ row: number; field: string; issue: string }> = [];
    
    if (!row || typeof row !== 'object') {
      issues.push({ row: rowNumber, field: 'row', issue: 'Invalid row data structure' });
      return issues;
    }

    // Check if row is completely empty
    const values = Object.values(row);
    if (values.every(val => val === null || val === undefined || val === '')) {
      issues.push({ row: rowNumber, field: 'row', issue: 'Row is completely empty' });
      return issues;
    }

    // Type-specific validation with detailed feedback
    switch (dataType) {
      case 'properties':
        this.validatePropertyWithDetails(row, rowNumber, issues, availableColumns);
        break;
      case 'owners':
        this.validateOwnerWithDetails(row, rowNumber, issues, availableColumns);
        break;
      case 'properties_owners':
        this.validatePropertyOwnerWithDetails(row, rowNumber, issues, availableColumns);
        break;
      case 'financial':
        this.validateFinancialWithDetails(row, rowNumber, issues, availableColumns);
        break;
      default:
        this.validateGenericWithDetails(row, rowNumber, issues, availableColumns);
    }

    return issues;
  },

  validatePropertyWithDetails(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>, availableColumns: string[]) {
    const addressFields = ['address', 'property_address', 'street_address'];
    const hasAddress = addressFields.some(field => row[field] && String(row[field]).trim());
    
    if (!hasAddress) {
      const availableAddressFields = availableColumns.filter(col => 
        addressFields.some(addr => col.toLowerCase().includes(addr.toLowerCase()))
      );
      issues.push({ 
        row: rowNumber, 
        field: 'address', 
        issue: `Address is required. Available fields: ${availableAddressFields.join(', ') || 'None found'}` 
      });
    }
  },

  validateOwnerWithDetails(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>, availableColumns: string[]) {
    if (!row.first_name && !row.name) {
      issues.push({ row: rowNumber, field: 'first_name', issue: 'First name is required' });
    }
    if (!row.last_name && !row.name) {
      issues.push({ row: rowNumber, field: 'last_name', issue: 'Last name is required' });
    }
    if (row.email && !this.isValidEmail(row.email)) {
      issues.push({ row: rowNumber, field: 'email', issue: `Invalid email format: ${row.email}` });
    }
  },

  validatePropertyOwnerWithDetails(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>, availableColumns: string[]) {
    this.validatePropertyWithDetails(row, rowNumber, issues, availableColumns);
    if (!row.owner_name && !row.first_name) {
      issues.push({ row: rowNumber, field: 'owner_name', issue: 'Owner name is required' });
    }
  },

  validateFinancialWithDetails(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>, availableColumns: string[]) {
    if (!row.amount && !row.balance && !row.payment_amount) {
      issues.push({ row: rowNumber, field: 'amount', issue: 'Amount field is required' });
    }
    if (row.amount && isNaN(parseFloat(row.amount))) {
      issues.push({ row: rowNumber, field: 'amount', issue: `Amount must be a valid number, got: ${row.amount}` });
    }
  },

  validateGenericWithDetails(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>, availableColumns: string[]) {
    const keys = Object.keys(row);
    if (keys.length === 0) {
      issues.push({ row: rowNumber, field: 'row', issue: 'Row contains no data' });
    }
  },

  addContextualSuggestions(issues: Array<{ row: number; field: string; issue: string }>, suggestedFixes: string[], dataType: string) {
    const commonIssues = issues.reduce((acc, issue) => {
      acc[issue.field] = (acc[issue.field] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(commonIssues).forEach(([field, count]) => {
      if (count > 1) {
        suggestedFixes.push(`Multiple rows missing ${field} - check column mapping`);
      }
    });

    const emailIssues = issues.filter(i => i.issue.includes('email')).length;
    if (emailIssues > 0) {
      suggestedFixes.push('Check email format in source data');
    }

    if (dataType === 'properties' && issues.some(i => i.field === 'address')) {
      suggestedFixes.push('Ensure address column is properly mapped and contains valid addresses');
    }
  },

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};
