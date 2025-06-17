
import { ValidationResult } from '@/types/import-types';

export const validationService = {
  validateData: async (
    data: any[],
    importType: string,
    associationId?: string
  ): Promise<ValidationResult> => {
    if (!data || data.length === 0) {
      return {
        valid: false,
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        warnings: 0,
        issues: []
      };
    }
    
    console.log(`Validating ${data.length} rows of ${importType} data`);
    
    const issues: Array<{ row: number; field: string; issue: string }> = [];
    let warnings = 0;
    
    // Define required fields based on import type
    const requiredFields: Record<string, string[]> = {
      properties: ['address', 'property_type'],
      owners: ['first_name', 'last_name'],
      properties_owners: ['address'],
      financial: ['amount', 'due_date'],
      compliance: ['violation_type', 'description'],
      maintenance: ['title', 'description'],
      associations: ['name'],
    };

    // Add association identifier requirement for "all associations" imports
    if (associationId === 'all' && importType !== 'associations') {
      // Check if any of the association identifier columns exist
      const associationColumns = ['association_id', 'association_name', 'association_code', 'hoa_id', 'hoa_name'];
      const hasAssociationColumn = data.length > 0 && associationColumns.some(col => 
        Object.keys(data[0]).some(key => key.toLowerCase().includes(col.replace('_', '').toLowerCase()))
      );
      
      if (!hasAssociationColumn) {
        issues.push({
          row: 0,
          field: 'association_identifier',
          issue: 'When importing for "All Associations", your file must include an association identifier column (Association ID, Association Name, or Association Code)'
        });
      }
    }
    
    // Define field type validations
    const fieldValidators: Record<string, (value: any) => boolean> = {
      email: (value) => {
        if (!value) return true; // Optional field
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      phone: (value) => {
        if (!value) return true; // Optional field
        return /^[0-9\-\+\(\)\s\.]{7,20}$/.test(value);
      },
      zip: (value) => {
        if (!value) return true; // Optional field
        return /^[0-9\-\s]{5,10}$/.test(value);
      },
      number: (value) => {
        if (value === undefined || value === null || value === '') return true; // Optional field
        return !isNaN(Number(value));
      },
      date: (value) => {
        if (!value) return true; // Optional field
        return !isNaN(Date.parse(value));
      },
      boolean: (value) => {
        if (value === undefined || value === null || value === '') return true; // Optional field
        return typeof value === 'boolean' || value === 'true' || value === 'false' || value === 1 || value === 0;
      }
    };
    
    // Map fields to their validators
    const fieldTypeMap: Record<string, string> = {
      email: 'email',
      contact_email: 'email',
      'owner.email': 'email',
      phone: 'phone',
      'owner.phone': 'phone',
      zip: 'zip',
      'property.zip': 'zip',
      square_feet: 'number',
      'property.square_feet': 'number',
      bedrooms: 'number',
      'property.bedrooms': 'number',
      bathrooms: 'number',
      'property.bathrooms': 'number',
      amount: 'number',
      due_date: 'date',
      payment_date: 'date',
      move_in_date: 'date',
      'owner.move_in_date': 'date',
      move_out_date: 'date',
      'owner.move_out_date': 'date',
      closing_date: 'date',
      'owner.closing_date': 'date',
      is_primary: 'boolean',
      'owner.is_primary': 'boolean'
    };
    
    // Validate each row
    data.forEach((row, rowIndex) => {
      // Check for required fields
      const required = requiredFields[importType] || [];
      
      required.forEach(field => {
        if (row[field] === undefined || row[field] === null || row[field] === '') {
          issues.push({
            row: rowIndex + 1,
            field,
            issue: `Missing required field: ${field}`
          });
        }
      });
      
      // Validate field types
      Object.entries(row).forEach(([field, value]) => {
        const fieldType = fieldTypeMap[field];
        if (fieldType && fieldValidators[fieldType]) {
          if (!fieldValidators[fieldType](value)) {
            issues.push({
              row: rowIndex + 1,
              field,
              issue: `Invalid ${fieldType} format: ${value}`
            });
          }
        }
      });
      
      // Special validations for specific import types
      if (importType === 'properties_owners') {
        // Check if address is present
        if (!row.address) {
          issues.push({
            row: rowIndex + 1,
            field: 'address',
            issue: 'Missing property address'
          });
        }
        
        // Check if either first_name or last_name is present
        if (!row.first_name && !row.last_name) {
          warnings++;
          issues.push({
            row: rowIndex + 1,
            field: 'first_name/last_name',
            issue: 'Warning: Missing owner name information'
          });
        }
      }

      // Validate association identifier for "all associations" imports
      if (associationId === 'all' && importType !== 'associations') {
        const associationIdentifiers = [
          row.association_id, row.association_name, row.association_code,
          row.hoa_id, row.hoa_name, row['Association ID'], row['Association Name'], 
          row['Association Code'], row['HOA ID'], row['HOA Name']
        ];
        
        const hasValidIdentifier = associationIdentifiers.some(id => id && String(id).trim());
        
        if (!hasValidIdentifier) {
          issues.push({
            row: rowIndex + 1,
            field: 'association_identifier',
            issue: 'Missing association identifier (Association ID, Name, or Code required for multi-association imports)'
          });
        }
      }
    });
    
    const invalidRows = new Set(issues.map(issue => issue.row)).size;
    
    return {
      valid: invalidRows === 0,
      totalRows: data.length,
      validRows: data.length - invalidRows,
      invalidRows,
      warnings,
      issues
    };
  }
};

export default validationService;
