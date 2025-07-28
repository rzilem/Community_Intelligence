
import { ValidationResult } from '@/types/import-types';
import { devLog } from '@/utils/dev-logger';

export const validationService = {
  async validateData(
    data: any[],
    dataType: string,
    associationId: string
  ): Promise<ValidationResult> {
    try {
      devLog.info('Starting enhanced data validation:', { dataType, recordCount: data.length, associationId });
      
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

      // Enhanced validation with better categorization
      const issues: Array<{ row: number; field: string; issue: string }> = [];
      let validRows = 0;
      let warnings = 0;

      // Pre-validation checks
      const sampleData = data.slice(0, Math.min(5, data.length));
      const detectedColumns = this.detectColumns(sampleData);
      const missingRequiredFields = this.checkRequiredFields(dataType, detectedColumns);
      
      if (missingRequiredFields.length > 0) {
        issues.push(...missingRequiredFields.map(field => ({
          row: 0,
          field: 'structure',
          issue: `Missing required column: ${field}`
        })));
      }

      // Validate each row with enhanced checks
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowIssues = this.validateRowEnhanced(row, dataType, i + 1, detectedColumns);
        
        if (rowIssues.length === 0) {
          validRows++;
        } else {
          const criticalIssues = rowIssues.filter(issue => 
            issue.issue.includes('required') || 
            issue.issue.includes('invalid') ||
            issue.issue.includes('missing')
          );
          const warningIssues = rowIssues.filter(issue => 
            !issue.issue.includes('required') && 
            !issue.issue.includes('invalid') &&
            !issue.issue.includes('missing')
          );
          
          warnings += warningIssues.length;
          
          // Only count critical issues towards invalid rows
          if (criticalIssues.length === 0) {
            validRows++;
          }
          
          issues.push(...rowIssues);
        }
      }

      const invalidRows = data.length - validRows;
      const result: ValidationResult = {
        valid: invalidRows === 0 && missingRequiredFields.length === 0,
        totalRows: data.length,
        validRows,
        invalidRows,
        warnings,
        issues
      };

      devLog.info('Enhanced validation completed:', {
        ...result,
        detectedColumns,
        missingRequiredFields
      });
      
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

  detectColumns(sampleData: any[]): string[] {
    const allKeys = new Set<string>();
    sampleData.forEach(row => {
      if (row && typeof row === 'object') {
        Object.keys(row).forEach(key => allKeys.add(key));
      }
    });
    return Array.from(allKeys);
  },

  checkRequiredFields(dataType: string, detectedColumns: string[]): string[] {
    const requiredFields = this.getRequiredFieldsForType(dataType);
    return requiredFields.filter(field => {
      // Check if any detected column matches this required field (flexible matching)
      return !detectedColumns.some(col => 
        col.toLowerCase().includes(field.toLowerCase()) ||
        field.toLowerCase().includes(col.toLowerCase()) ||
        this.getFieldAliases(field).some(alias => 
          col.toLowerCase().includes(alias.toLowerCase())
        )
      );
    });
  },

  getRequiredFieldsForType(dataType: string): string[] {
    switch (dataType) {
      case 'properties':
        return ['address'];
      case 'owners':
      case 'homeowners':
        return ['name', 'email'];
      case 'properties_owners':
        return ['address', 'owner_name'];
      case 'financial':
      case 'assessments':
        return ['amount', 'property'];
      case 'compliance':
        return ['violation_type', 'property'];
      case 'maintenance':
        return ['title', 'property'];
      case 'residents':
        return ['name', 'property'];
      default:
        return [];
    }
  },

  getFieldAliases(field: string): string[] {
    const aliases: Record<string, string[]> = {
      'address': ['property_address', 'street_address', 'location', 'addr'],
      'name': ['owner_name', 'full_name', 'first_name', 'last_name'],
      'email': ['email_address', 'contact_email', 'owner_email'],
      'amount': ['balance', 'payment_amount', 'assessment_amount', 'fee'],
      'property': ['property_id', 'unit', 'unit_number', 'property_address'],
      'owner_name': ['homeowner_name', 'resident_name', 'tenant_name']
    };
    return aliases[field.toLowerCase()] || [];
  },

  validateRowEnhanced(row: any, dataType: string, rowNumber: number, detectedColumns: string[]): Array<{ row: number; field: string; issue: string }> {
    const issues: Array<{ row: number; field: string; issue: string }> = [];
    
    if (!row || typeof row !== 'object') {
      issues.push({ row: rowNumber, field: 'row', issue: 'Invalid row data' });
      return issues;
    }

    // Enhanced validation based on data type with flexible field matching
    switch (dataType) {
      case 'properties':
        this.validatePropertyEnhanced(row, rowNumber, issues, detectedColumns);
        break;
      case 'owners':
      case 'homeowners':
        this.validateOwnerEnhanced(row, rowNumber, issues, detectedColumns);
        break;
      case 'properties_owners':
        this.validatePropertyOwnerEnhanced(row, rowNumber, issues, detectedColumns);
        break;
      case 'financial':
      case 'assessments':
        this.validateFinancialEnhanced(row, rowNumber, issues, detectedColumns);
        break;
      case 'compliance':
        this.validateComplianceEnhanced(row, rowNumber, issues, detectedColumns);
        break;
      case 'maintenance':
        this.validateMaintenanceEnhanced(row, rowNumber, issues, detectedColumns);
        break;
      case 'residents':
        this.validateResidentEnhanced(row, rowNumber, issues, detectedColumns);
        break;
      case 'associations':
        this.validateAssociationEnhanced(row, rowNumber, issues, detectedColumns);
        break;
      default:
        this.validateGenericEnhanced(row, rowNumber, issues);
    }

    return issues;
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

  // Enhanced validation methods
  validatePropertyEnhanced(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>, detectedColumns: string[]) {
    const addressField = this.findField(row, ['address', 'property_address', 'street_address', 'location']);
    if (!addressField) {
      issues.push({ row: rowNumber, field: 'address', issue: 'Address is required' });
    }
  },

  validateOwnerEnhanced(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>, detectedColumns: string[]) {
    const nameField = this.findField(row, ['name', 'owner_name', 'full_name', 'first_name']);
    const emailField = this.findField(row, ['email', 'email_address', 'contact_email']);
    
    if (!nameField) {
      issues.push({ row: rowNumber, field: 'name', issue: 'Name is required' });
    }
    
    if (emailField && !this.isValidEmail(emailField)) {
      issues.push({ row: rowNumber, field: 'email', issue: 'Invalid email format' });
    }
  },

  validatePropertyOwnerEnhanced(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>, detectedColumns: string[]) {
    this.validatePropertyEnhanced(row, rowNumber, issues, detectedColumns);
    this.validateOwnerEnhanced(row, rowNumber, issues, detectedColumns);
  },

  validateFinancialEnhanced(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>, detectedColumns: string[]) {
    const amountField = this.findField(row, ['amount', 'balance', 'payment_amount', 'assessment_amount']);
    const propertyField = this.findField(row, ['property_id', 'unit', 'unit_number', 'property_address']);
    
    if (!amountField) {
      issues.push({ row: rowNumber, field: 'amount', issue: 'Amount is required' });
    } else if (isNaN(parseFloat(amountField))) {
      issues.push({ row: rowNumber, field: 'amount', issue: 'Amount must be a valid number' });
    }
    
    if (!propertyField) {
      issues.push({ row: rowNumber, field: 'property', issue: 'Property identifier is required' });
    }
  },

  validateComplianceEnhanced(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>, detectedColumns: string[]) {
    const violationField = this.findField(row, ['violation_type', 'issue_type', 'compliance_type']);
    const propertyField = this.findField(row, ['property_id', 'unit', 'unit_number', 'property_address']);
    
    if (!violationField) {
      issues.push({ row: rowNumber, field: 'violation_type', issue: 'Violation type is required' });
    }
    
    if (!propertyField) {
      issues.push({ row: rowNumber, field: 'property', issue: 'Property identifier is required' });
    }
  },

  validateMaintenanceEnhanced(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>, detectedColumns: string[]) {
    const titleField = this.findField(row, ['title', 'description', 'issue_title', 'request_title']);
    const propertyField = this.findField(row, ['property_id', 'unit', 'unit_number', 'property_address']);
    
    if (!titleField) {
      issues.push({ row: rowNumber, field: 'title', issue: 'Title or description is required' });
    }
    
    if (!propertyField) {
      issues.push({ row: rowNumber, field: 'property', issue: 'Property identifier is required' });
    }
  },

  validateResidentEnhanced(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>, detectedColumns: string[]) {
    const nameField = this.findField(row, ['name', 'resident_name', 'first_name', 'full_name']);
    const propertyField = this.findField(row, ['property_id', 'unit', 'unit_number', 'property_address']);
    
    if (!nameField) {
      issues.push({ row: rowNumber, field: 'name', issue: 'Resident name is required' });
    }
    
    if (!propertyField) {
      issues.push({ row: rowNumber, field: 'property', issue: 'Property identifier is required' });
    }
  },

  validateAssociationEnhanced(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>, detectedColumns: string[]) {
    const nameField = this.findField(row, ['name', 'association_name', 'hoa_name']);
    
    if (!nameField) {
      issues.push({ row: rowNumber, field: 'name', issue: 'Association name is required' });
    }
  },

  validateGenericEnhanced(row: any, rowNumber: number, issues: Array<{ row: number; field: string; issue: string }>) {
    const keys = Object.keys(row);
    if (keys.length === 0) {
      issues.push({ row: rowNumber, field: 'row', issue: 'Row is empty' });
    }
    
    // Check for common data quality issues
    const emptyFields = keys.filter(key => !row[key] || row[key].toString().trim() === '');
    if (emptyFields.length > keys.length * 0.7) {
      issues.push({ row: rowNumber, field: 'data_quality', issue: 'Row has mostly empty fields' });
    }
  },

  findField(row: any, fieldNames: string[]): any {
    for (const fieldName of fieldNames) {
      if (row.hasOwnProperty(fieldName) && row[fieldName] !== null && row[fieldName] !== undefined && row[fieldName] !== '') {
        return row[fieldName];
      }
    }
    return null;
  },

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};
