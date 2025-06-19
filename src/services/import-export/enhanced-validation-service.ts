
import { devLog } from '@/utils/dev-logger';

export interface DetailedValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  criticalErrors: string[];
  warnings: string[];
  suggestions: string[];
  fieldAnalysis: Record<string, {
    present: boolean;
    fillRate: number;
    dataType: string;
    sampleValues: any[];
  }>;
}

export const enhancedValidationService = {
  async validateDataWithDetails(
    data: any[],
    dataType: string,
    associationId: string,
    filename?: string
  ): Promise<DetailedValidationResult> {
    try {
      devLog.info('Starting enhanced validation:', { dataType, recordCount: data.length, filename });
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        return {
          isValid: false,
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
          criticalErrors: ['No data provided for validation'],
          warnings: [],
          suggestions: ['Upload a file with valid data'],
          fieldAnalysis: {}
        };
      }

      const result: DetailedValidationResult = {
        isValid: true,
        totalRows: data.length,
        validRows: 0,
        invalidRows: 0,
        criticalErrors: [],
        warnings: [],
        suggestions: [],
        fieldAnalysis: {}
      };

      // Analyze field structure
      result.fieldAnalysis = this.analyzeFields(data);
      
      // Validate based on data type
      const typeValidation = this.validateByDataType(data, dataType, result.fieldAnalysis);
      result.criticalErrors.push(...typeValidation.criticalErrors);
      result.warnings.push(...typeValidation.warnings);
      result.suggestions.push(...typeValidation.suggestions);

      // Validate each row
      let validRows = 0;
      for (let i = 0; i < data.length; i++) {
        const rowValidation = this.validateRow(data[i], dataType, i + 1);
        if (rowValidation.isValid) {
          validRows++;
        } else {
          result.criticalErrors.push(...rowValidation.errors);
          result.warnings.push(...rowValidation.warnings);
        }
      }

      result.validRows = validRows;
      result.invalidRows = data.length - validRows;
      result.isValid = result.criticalErrors.length === 0 && validRows > 0;

      // Add suggestions based on validation results
      if (result.invalidRows > 0) {
        result.suggestions.push(`${result.invalidRows} rows have validation issues that need to be addressed`);
      }
      
      if (result.validRows > 0 && result.invalidRows > 0) {
        result.suggestions.push('Consider importing only the valid rows or fix the invalid data');
      }

      devLog.info('Enhanced validation completed:', {
        isValid: result.isValid,
        validRows: result.validRows,
        invalidRows: result.invalidRows,
        criticalErrors: result.criticalErrors.length,
        warnings: result.warnings.length
      });

      return result;
      
    } catch (error) {
      devLog.error('Enhanced validation error:', error);
      return {
        isValid: false,
        totalRows: data.length || 0,
        validRows: 0,
        invalidRows: data.length || 0,
        criticalErrors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        suggestions: ['Check the file format and data structure'],
        fieldAnalysis: {}
      };
    }
  },

  analyzeFields(data: any[]): Record<string, any> {
    if (data.length === 0) return {};
    
    const analysis: Record<string, any> = {};
    const allKeys = new Set<string>();
    
    // Collect all possible keys
    data.forEach(row => {
      Object.keys(row).forEach(key => allKeys.add(key));
    });

    // Analyze each field
    allKeys.forEach(key => {
      const values = data.map(row => row[key]).filter(val => val !== null && val !== undefined && val !== '');
      const fillRate = values.length / data.length;
      
      analysis[key] = {
        present: values.length > 0,
        fillRate,
        dataType: this.detectDataType(values),
        sampleValues: values.slice(0, 3)
      };
    });

    return analysis;
  },

  detectDataType(values: any[]): string {
    if (values.length === 0) return 'empty';
    
    const sample = values.slice(0, 10);
    
    if (sample.every(val => !isNaN(Number(val)) && !isNaN(parseFloat(val)))) {
      return 'number';
    }
    
    if (sample.every(val => typeof val === 'boolean' || val === 'true' || val === 'false')) {
      return 'boolean';
    }
    
    if (sample.some(val => String(val).includes('@') && String(val).includes('.'))) {
      return 'email';
    }
    
    if (sample.some(val => /^\d{4}-\d{2}-\d{2}/.test(String(val)))) {
      return 'date';
    }
    
    return 'text';
  },

  validateByDataType(data: any[], dataType: string, fieldAnalysis: Record<string, any>): {
    criticalErrors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const result = {
      criticalErrors: [] as string[],
      warnings: [] as string[],
      suggestions: [] as string[]
    };

    const fields = Object.keys(fieldAnalysis);
    
    switch (dataType) {
      case 'properties':
        if (!this.hasAddressField(fields)) {
          result.criticalErrors.push('No address column found. Ensure address column is properly mapped');
          result.suggestions.push('Look for columns like: address, street_address, property_address, full_address');
        }
        break;
        
      case 'owners':
        if (!this.hasNameField(fields)) {
          result.criticalErrors.push('No name column found. Owner records need first_name/last_name or full name');
          result.suggestions.push('Look for columns like: first_name, last_name, name, owner_name');
        }
        break;
        
      case 'financial':
        if (!this.hasAmountField(fields)) {
          result.criticalErrors.push('No amount/payment column found');
          result.suggestions.push('Look for columns like: amount, payment_amount, balance, total');
        }
        break;
    }

    // Check for empty required fields
    Object.entries(fieldAnalysis).forEach(([field, analysis]) => {
      if (analysis.fillRate < 0.5) {
        result.warnings.push(`Column '${field}' is mostly empty (${Math.round(analysis.fillRate * 100)}% filled)`);
      }
    });

    return result;
  },

  hasAddressField(fields: string[]): boolean {
    const addressPatterns = ['address', 'street', 'property_address', 'full_address', 'street_address'];
    return fields.some(field => 
      addressPatterns.some(pattern => 
        field.toLowerCase().includes(pattern)
      )
    );
  },

  hasNameField(fields: string[]): boolean {
    const namePatterns = ['name', 'first_name', 'last_name', 'owner_name', 'resident_name'];
    return fields.some(field => 
      namePatterns.some(pattern => 
        field.toLowerCase().includes(pattern)
      )
    );
  },

  hasAmountField(fields: string[]): boolean {
    const amountPatterns = ['amount', 'payment', 'balance', 'total', 'cost', 'price'];
    return fields.some(field => 
      amountPatterns.some(pattern => 
        field.toLowerCase().includes(pattern)
      )
    );
  },

  validateRow(row: any, dataType: string, rowNumber: number): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const result = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    if (!row || typeof row !== 'object') {
      result.isValid = false;
      result.errors.push(`Row ${rowNumber}: Invalid row data`);
      return result;
    }

    // Basic validation based on data type
    switch (dataType) {
      case 'properties':
        if (!this.getAddressValue(row)) {
          result.isValid = false;
          result.errors.push(`Row ${rowNumber}: Address is required`);
        }
        break;
        
      case 'owners':
        if (!this.getNameValue(row)) {
          result.isValid = false;
          result.errors.push(`Row ${rowNumber}: Name is required`);
        }
        
        const email = this.getEmailValue(row);
        if (email && !this.isValidEmail(email)) {
          result.warnings.push(`Row ${rowNumber}: Invalid email format`);
        }
        break;
        
      case 'financial':
        const amount = this.getAmountValue(row);
        if (!amount && amount !== 0) {
          result.isValid = false;
          result.errors.push(`Row ${rowNumber}: Amount is required`);
        } else if (isNaN(parseFloat(String(amount)))) {
          result.isValid = false;
          result.errors.push(`Row ${rowNumber}: Amount must be a valid number`);
        }
        break;
    }

    return result;
  },

  getAddressValue(row: any): string | null {
    const addressFields = ['address', 'street_address', 'property_address', 'full_address', 'street'];
    for (const field of addressFields) {
      const value = row[field] || row[field.toLowerCase()] || row[field.toUpperCase()];
      if (value && String(value).trim()) {
        return String(value).trim();
      }
    }
    return null;
  },

  getNameValue(row: any): string | null {
    const nameFields = ['name', 'owner_name', 'resident_name', 'full_name'];
    for (const field of nameFields) {
      const value = row[field] || row[field.toLowerCase()] || row[field.toUpperCase()];
      if (value && String(value).trim()) {
        return String(value).trim();
      }
    }
    
    // Try combining first and last name
    const firstName = row.first_name || row.First_Name || row.FIRST_NAME;
    const lastName = row.last_name || row.Last_Name || row.LAST_NAME;
    if (firstName || lastName) {
      return `${firstName || ''} ${lastName || ''}`.trim();
    }
    
    return null;
  },

  getEmailValue(row: any): string | null {
    const emailFields = ['email', 'email_address', 'contact_email'];
    for (const field of emailFields) {
      const value = row[field] || row[field.toLowerCase()] || row[field.toUpperCase()];
      if (value && String(value).trim()) {
        return String(value).trim();
      }
    }
    return null;
  },

  getAmountValue(row: any): number | null {
    const amountFields = ['amount', 'payment_amount', 'balance', 'total', 'cost', 'price'];
    for (const field of amountFields) {
      const value = row[field] || row[field.toLowerCase()] || row[field.toUpperCase()];
      if (value !== null && value !== undefined && value !== '') {
        const numValue = parseFloat(String(value).replace(/[$,]/g, ''));
        if (!isNaN(numValue)) {
          return numValue;
        }
      }
    }
    return null;
  },

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};
