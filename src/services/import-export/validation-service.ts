
import { ValidationResult } from '@/types/import-types';

export const validationService = {
  validateData: async (data: any[], dataType: string): Promise<ValidationResult> => {
    try {
      let requiredFields: string[] = [];
      
      switch (dataType) {
        case 'associations':
          requiredFields = ['name'];
          break;
        case 'owners':
          requiredFields = ['first_name', 'last_name'];
          break;
        case 'properties':
          requiredFields = ['address', 'property_type'];
          break;
        case 'financial':
          requiredFields = ['amount', 'due_date'];
          break;
        case 'compliance':
          requiredFields = ['violation_type', 'property_id'];
          break;
        case 'maintenance':
          requiredFields = ['title', 'description'];
          break;
        case 'vendors':
          requiredFields = ['name', 'category'];
          break;
        default:
          requiredFields = [];
      }
      
      const totalRows = data.length;
      let invalidRows = 0;
      let warnings = 0;
      const issues: Array<{ row: number; field: string; issue: string }> = [];
      
      data.forEach((row, rowIndex) => {
        let rowHasError = false;
        
        for (const field of requiredFields) {
          if (!row[field] || row[field].toString().trim() === '') {
            issues.push({
              row: rowIndex + 1,
              field,
              issue: 'Required field is missing or empty'
            });
            rowHasError = true;
          }
        }
        
        if (dataType === 'financial' && row.amount && isNaN(Number(row.amount))) {
          issues.push({
            row: rowIndex + 1,
            field: 'amount',
            issue: 'Amount must be a number'
          });
          rowHasError = true;
        }
        
        if (dataType === 'vendors') {
          if (row.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(row.phone)) {
            issues.push({
              row: rowIndex + 1,
              field: 'phone',
              issue: 'Phone number format is invalid'
            });
            warnings++;
          }
          
          if (row.email && !/^\S+@\S+\.\S+$/.test(row.email)) {
            issues.push({
              row: rowIndex + 1,
              field: 'email',
              issue: 'Email format is invalid'
            });
            warnings++;
          }
        }
        
        if (rowHasError) {
          invalidRows++;
        }
      });
      
      const fieldsToCheckDupes: Record<string, string[]> = {
        'properties': ['address', 'unit_number'],
        'owners': ['email'],
        'maintenance': ['title'],
        'vendors': ['email', 'name']
      };
      
      if (fieldsToCheckDupes[dataType]) {
        const fields = fieldsToCheckDupes[dataType];
        const valuesSeen: Record<string, Set<string>> = {};
        fields.forEach(field => valuesSeen[field] = new Set());
        
        data.forEach((row, rowIndex) => {
          fields.forEach(field => {
            if (row[field]) {
              const value = row[field].toString().toLowerCase().trim();
              if (valuesSeen[field].has(value)) {
                warnings++;
                issues.push({
                  row: rowIndex + 1,
                  field,
                  issue: `Potential duplicate value: ${value}`
                });
              } else {
                valuesSeen[field].add(value);
              }
            }
          });
        });
      }
      
      return {
        valid: invalidRows === 0,
        totalRows,
        validRows: totalRows - invalidRows,
        invalidRows,
        warnings,
        issues
      };
    } catch (error) {
      console.error('Error validating data:', error);
      throw error;
    }
  }
};
