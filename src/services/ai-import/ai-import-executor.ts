import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ImportExecutionResult {
  success: boolean;
  importedRecords: number;
  failedRecords: number;
  totalRecords: number;
  errors: string[];
  warnings: string[];
  validationErrors: string[];
  requiredFieldsErrors: string[];
  details: Array<{
    table: string;
    succeeded: number;
    failed: number;
    errors: string[];
  }>;
}

export interface AIAnalysisResult {
  dataType: string;
  confidence: number;
  targetTables: string[];
  fieldMappings: Record<string, string>;
  tableAssignments?: Record<string, string[]>;
  dataQuality: {
    issues: string[];
    warnings: string[];
    suggestions: string[];
  };
  transformations: Array<{
    field: string;
    action: string;
    description: string;
  }>;
  requiredFields: string[];
  missingFields: string[];
  suggestedDefaults: Record<string, any>;
  relationships: Array<{
    type: string;
    description: string;
  }>;
  summary: string;
}

class AIImportExecutor {
  private readonly REQUIRED_FIELDS_BY_TABLE: Record<string, string[]> = {
    properties: ['address', 'property_type'],
    residents: ['first_name', 'last_name', 'email'],
    assessments: ['property_id', 'amount', 'due_date'],
    maintenance_requests: ['property_id', 'title', 'description'],
    compliance_violations: ['property_id', 'violation_type'],
    associations: ['name']
  };

  private readonly DEFAULT_VALUES: Record<string, any> = {
    property_type: 'Residential',
    status: 'active',
    payment_status: 'unpaid',
    priority: 'medium',
    violation_status: 'open'
  };

  async executeImport(
    analysisResult: AIAnalysisResult,
    fileData: any[],
    associationId: string
  ): Promise<ImportExecutionResult> {
    const result: ImportExecutionResult = {
      success: false,
      importedRecords: 0,
      failedRecords: 0,
      totalRecords: fileData.length,
      errors: [],
      warnings: [],
      validationErrors: [],
      requiredFieldsErrors: [],
      details: []
    };

    try {
      // Pre-import validation
      const validationResult = await this.validateImportData(analysisResult, fileData, associationId);
      if (!validationResult.valid) {
        result.validationErrors = validationResult.errors;
        result.requiredFieldsErrors = validationResult.requiredFieldsErrors;
        result.errors.push(...validationResult.errors);
        
        toast.error(`Validation failed: ${validationResult.errors.join(', ')}`);
        return result;
      }

      // Apply warnings from validation
      result.warnings.push(...validationResult.warnings);

      // Process data with intelligent defaults
      const processedData = await this.processDataWithDefaults(
        analysisResult,
        fileData,
        associationId
      );

      // Execute import by table
      for (const table of analysisResult.targetTables) {
        const tableData = this.filterDataForTable(processedData, analysisResult, table);
        
        if (tableData.length === 0) {
          result.warnings.push(`No data found for table: ${table}`);
          continue;
        }

        const tableResult = await this.importToTable(table, tableData, associationId);
        result.details.push(tableResult);
        result.importedRecords += tableResult.succeeded;
        result.failedRecords += tableResult.failed;
        result.errors.push(...tableResult.errors);
      }

      result.success = result.importedRecords > 0;
      
      if (result.success) {
        toast.success(`Successfully imported ${result.importedRecords} records`);
      } else {
        toast.error(`Import failed: ${result.errors.join(', ')}`);
      }

      return result;

    } catch (error) {
      console.error('Import execution error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMessage);
      toast.error(`Import failed: ${errorMessage}`);
      return result;
    }
  }

  private async validateImportData(
    analysisResult: AIAnalysisResult,
    fileData: any[],
    associationId: string
  ): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    requiredFieldsErrors: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const requiredFieldsErrors: string[] = [];

    // Check if we have any data
    if (!fileData || fileData.length === 0) {
      errors.push('No data provided for import');
      return { valid: false, errors, warnings, requiredFieldsErrors };
    }

    // Check if we have target tables
    if (!analysisResult.targetTables || analysisResult.targetTables.length === 0) {
      errors.push('No target tables identified for import');
      return { valid: false, errors, warnings, requiredFieldsErrors };
    }

    // Check field mappings
    if (!analysisResult.fieldMappings || Object.keys(analysisResult.fieldMappings).length === 0) {
      errors.push('No field mappings provided');
      return { valid: false, errors, warnings, requiredFieldsErrors };
    }

    // Validate required fields for each target table
    for (const table of analysisResult.targetTables) {
      const requiredFields = this.REQUIRED_FIELDS_BY_TABLE[table] || [];
      const mappedFields = Object.values(analysisResult.fieldMappings);
      
      const missingFields = requiredFields.filter(field => 
        !mappedFields.includes(field) && !this.DEFAULT_VALUES[field]
      );

      if (missingFields.length > 0) {
        const errorMsg = `Missing required fields for ${table}: ${missingFields.join(', ')}`;
        requiredFieldsErrors.push(errorMsg);
        errors.push(errorMsg);
      }
    }

    // Check data quality
    const sampleSize = Math.min(fileData.length, 100);
    const sampleData = fileData.slice(0, sampleSize);
    
    for (const row of sampleData) {
      const mappedFields = Object.keys(analysisResult.fieldMappings);
      const availableFields = Object.keys(row);
      
      const missingSourceFields = mappedFields.filter(field => !availableFields.includes(field));
      if (missingSourceFields.length > 0) {
        warnings.push(`Some rows may be missing source fields: ${missingSourceFields.join(', ')}`);
        break;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      requiredFieldsErrors
    };
  }

  private async processDataWithDefaults(
    analysisResult: AIAnalysisResult,
    fileData: any[],
    associationId: string
  ): Promise<any[]> {
    return fileData.map(row => {
      const processedRow = { ...row };
      
      // Apply field mappings
      for (const [sourceField, targetField] of Object.entries(analysisResult.fieldMappings)) {
        if (row[sourceField] !== undefined) {
          processedRow[targetField] = row[sourceField];
        }
      }

      // Apply default values for missing required fields
      for (const [field, defaultValue] of Object.entries(this.DEFAULT_VALUES)) {
        if (processedRow[field] === undefined || processedRow[field] === '') {
          processedRow[field] = defaultValue;
        }
      }

      // Add association_id
      processedRow.association_id = associationId;

      return processedRow;
    });
  }

  private filterDataForTable(
    processedData: any[],
    analysisResult: AIAnalysisResult,
    table: string
  ): any[] {
    const tableFields = this.REQUIRED_FIELDS_BY_TABLE[table] || [];
    const tableAssignments = analysisResult.tableAssignments?.[table] || [];
    
    return processedData.filter(row => {
      // Check if row has at least one required field for this table
      return tableFields.some(field => row[field] !== undefined && row[field] !== '');
    }).map(row => {
      // Only include fields relevant to this table
      const filteredRow: any = { association_id: row.association_id };
      
      // Include mapped fields for this table
      for (const [sourceField, targetField] of Object.entries(analysisResult.fieldMappings)) {
        if (tableAssignments.includes(sourceField) || tableFields.includes(targetField)) {
          filteredRow[targetField] = row[targetField] || row[sourceField];
        }
      }

      return filteredRow;
    });
  }

  private async importToTable(
    table: string,
    data: any[],
    associationId: string
  ): Promise<{
    table: string;
    succeeded: number;
    failed: number;
    errors: string[];
  }> {
    const result = {
      table,
      succeeded: 0,
      failed: 0,
      errors: []
    };

    try {
      const { data: insertedData, error } = await supabase
        .from(table as any)
        .insert(data)
        .select();

      if (error) {
        result.errors.push(`${table}: ${error.message}`);
        result.failed = data.length;
      } else {
        result.succeeded = insertedData?.length || 0;
        result.failed = data.length - result.succeeded;
      }

    } catch (error) {
      console.error(`Error importing to ${table}:`, error);
      result.errors.push(`${table}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.failed = data.length;
    }

    return result;
  }
}

export const aiImportExecutor = new AIImportExecutor();