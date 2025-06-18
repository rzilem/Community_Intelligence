
import { ValidationResult } from '@/types/import-types';
import { devLog } from '@/utils/dev-logger';

export const validationService = {
  async validateData(
    data: any[],
    dataType: string,
    associationId: string
  ): Promise<ValidationResult> {
    try {
      devLog.info('Starting data validation:', { dataType, recordCount: data.length });
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        return {
          valid: false,
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
          warnings: 0,
          issues: [{ row: 0, field: 'data', issue: 'No data provided for validation' }]
        };
      }

      const issues: Array<{ row: number; field: string; issue: string }> = [];
      let validRows = 0;
      let warnings = 0;

      // Validate each row
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowIssues = this.validateRow(row, dataType, i + 1);
        
        if (rowIssues.length === 0) {
          validRows++;
        } else {
          const criticalIssues = rowIssues.filter(issue => issue.issue.includes('required') || issue.issue.includes('invalid'));
          const warningIssues = rowIssues.filter(issue => !issue.issue.includes('required') && !issue.issue.includes('invalid'));
          
          warnings += warningIssues.length;
          issues.push(...rowIssues);
        }
      }

      const invalidRows = data.length - validRows;
      const result: ValidationResult = {
        valid: invalidRows === 0,
        totalRows: data.length,
        validRows,
        invalidRows,
        warnings,
        issues
      };

      devLog.info('Validation completed:', result);
      return result;
    } catch (error) {
      devLog.error('Validation error:', error);
      return {
        valid: false,
        totalRows: data.length || 0,
        validRows: 0,
        invalidRows: data.length || 0,
        warnings: 0,
        issues: [{ row: 0, field: 'validation', issue: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` }]
      };
    }
  },

  validateRow(row: any, dataType: string, rowNumber: number): Array<{ row: number; field: string; issue: string }> {
    const issues: Array<{ row: number; field: string; issue: string }> = [];
    
    if (!row || typeof row !== 'object') {
      issues.push({ row: rowNumber, field: 'row', issue: 'Invalid row data' });
      return issues;
    }

    // Validate based on data type
    switch (dataType) {
      case 'properties':
        this.validateProperty(row, rowNumber, issues);
        break;
      case 'owners':
        this.validateOwner(row, rowNumber, issues);
        break;
      case 'properties_owners':
        this.validatePropertyOwner(row, rowNumber, issues);
        break;
      case 'financial':
        this.validateFinancial(row, rowNumber, issues);
        break;
      case 'compliance':
        this.validateCompliance(row, rowNumber, issues);
        break;
      case 'maintenance':
        this.validateMaintenance(row, rowNumber, issues);
        break;
      case 'associations':
        this.validateAssociation(row, rowNumber, issues);
        break;
      default:
        // Generic validation
        this.validateGeneric(row, rowNumber, issues);
    }

    return issues;
  },

  validateProperty(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>) {
    if (!row.address && !row.property_address && !row.street_address) {
      issues.push({ row: rowNumber, field: 'address', issue: 'Address is required' });
    }
  },

  validateOwner(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>) {
    if (!row.first_name && !row.name) {
      issues.push({ row: rowNumber, field: 'first_name', issue: 'First name is required' });
    }
    if (!row.last_name && !row.name) {
      issues.push({ row: rowNumber, field: 'last_name', issue: 'Last name is required' });
    }
    if (row.email && !this.isValidEmail(row.email)) {
      issues.push({ row: rowNumber, field: 'email', issue: 'Invalid email format' });
    }
  },

  validatePropertyOwner(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>) {
    this.validateProperty(row, rowNumber, issues);
    if (!row.owner_name && !row.first_name) {
      issues.push({ row: rowNumber, field: 'owner_name', issue: 'Owner name is required' });
    }
  },

  validateFinancial(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>) {
    if (!row.amount && !row.balance && !row.payment_amount) {
      issues.push({ row: rowNumber, field: 'amount', issue: 'Amount is required' });
    }
    if (row.amount && isNaN(parseFloat(row.amount))) {
      issues.push({ row: rowNumber, field: 'amount', issue: 'Amount must be a valid number' });
    }
  },

  validateCompliance(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>) {
    if (!row.violation_type && !row.issue_type) {
      issues.push({ row: rowNumber, field: 'violation_type', issue: 'Violation type is required' });
    }
  },

  validateMaintenance(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>) {
    if (!row.title && !row.description) {
      issues.push({ row: rowNumber, field: 'title', issue: 'Title or description is required' });
    }
  },

  validateAssociation(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>) {
    if (!row.name && !row.association_name) {
      issues.push({ row: rowNumber, field: 'name', issue: 'Association name is required' });
    }
  },

  validateGeneric(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>) {
    const keys = Object.keys(row);
    if (keys.length === 0) {
      issues.push({ row: rowNumber, field: 'row', issue: 'Row is empty' });
    }
  },

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};
