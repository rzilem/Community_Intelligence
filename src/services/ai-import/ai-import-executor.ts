import { supabase } from '@/integrations/supabase/client';
import { SmartImportResult } from '@/types/import-types';

interface AIAnalysisResult {
  dataType: string;
  confidence: number;
  targetTables: string[];
  fieldMappings: Record<string, string>;
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
  validation?: {
    validMappings: Record<string, { targetField: string; table: string }>;
    invalidMappings: Record<string, { targetField: string; reason: string; assignedTable?: string }>;
    suggestions: Array<{ sourceField: string; invalidField: string; suggestedField: string; table: string }>;
  };
}

interface ProcessedData {
  mappedData: any[];
  validationResults: {
    validRows: number;
    invalidRows: number;
    totalRows: number;
    errors: Array<{
      row: number;
      field: string;
      error: string;
    }>;
  };
}

export class AIImportExecutor {
  
  /**
   * Execute the actual data import based on AI analysis
   */
  async executeImport(
    analysisResult: AIAnalysisResult,
    originalData: any[],
    associationId: string,
    userId?: string
  ): Promise<SmartImportResult> {
    const importResult: SmartImportResult = {
      success: false,
      totalProcessed: 0,
      successfulImports: 0,
      failedImports: 0,
      totalFiles: 1,
      processedFiles: 0,
      skippedFiles: 0,
      totalRecords: 0,
      importedRecords: 0,
      details: [],
      errors: [],
      warnings: [],
    };

    try {
      // Step 0: Validate analysis result
      const validationErrors = this.validateAnalysisResult(analysisResult);
      if (validationErrors.length > 0) {
        importResult.errors.push(...validationErrors);
        return importResult;
      }

      // Step 1: Process and validate data
      const processedData = await this.processDataWithTransformations(
        originalData,
        analysisResult
      );

      importResult.totalRecords = processedData.validationResults.totalRows;
      importResult.totalProcessed = processedData.validationResults.totalRows;

      // Step 2: Import to target tables
      for (const targetTable of analysisResult.targetTables) {
        const tableData = await this.prepareDataForTable(
          processedData.mappedData,
          targetTable,
          analysisResult,
          associationId
        );

        if (tableData.length > 0) {
          const tableResult = await this.importToTable(
            targetTable,
            tableData,
            associationId
          );

          importResult.successfulImports += tableResult.success;
          importResult.failedImports += tableResult.failed;
          importResult.importedRecords += tableResult.success;

          importResult.details.push({
            filename: `${targetTable}_import`,
            status: tableResult.success > 0 ? 'success' : 'error',
            recordsProcessed: tableResult.success + tableResult.failed,
            message: `Imported ${tableResult.success} records to ${targetTable}`,
          });

          if (tableResult.errors.length > 0) {
            importResult.errors.push(...tableResult.errors);
          }
        }
      }

      // Step 3: Handle relationships
      if (analysisResult.relationships.length > 0) {
        await this.processRelationships(analysisResult.relationships, associationId);
      }

      importResult.success = importResult.successfulImports > 0;
      importResult.processedFiles = 1;

      // Add warnings from data quality analysis
      if (analysisResult.dataQuality.warnings.length > 0) {
        importResult.warnings.push(...analysisResult.dataQuality.warnings);
      }

      return importResult;

    } catch (error) {
      console.error('Import execution error:', error);
      importResult.errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return importResult;
    }
  }

  /**
   * Process data with AI-suggested transformations
   */
  private async processDataWithTransformations(
    data: any[],
    analysisResult: AIAnalysisResult
  ): Promise<ProcessedData> {
    const mappedData: any[] = [];
    const errors: Array<{ row: number; field: string; error: string }> = [];
    let validRows = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const mappedRow: any = {};
      let rowValid = true;

      // Apply field mappings
      for (const [sourceField, targetField] of Object.entries(analysisResult.fieldMappings)) {
        let value = row[sourceField];

        // Apply transformations
        const transformation = analysisResult.transformations.find(t => t.field === sourceField);
        if (transformation) {
          value = this.applyTransformation(value, transformation);
        }

        // Apply defaults for missing values
        if ((value === null || value === undefined || value === '') && 
            analysisResult.suggestedDefaults[targetField]) {
          value = analysisResult.suggestedDefaults[targetField];
        }

        // Validate required fields
        if (analysisResult.requiredFields.includes(targetField) && 
            (value === null || value === undefined || value === '')) {
          errors.push({
            row: i + 1,
            field: targetField,
            error: `Required field ${targetField} is missing`
          });
          rowValid = false;
        }

        mappedRow[targetField] = value;
      }

      if (rowValid) {
        validRows++;
        mappedData.push(mappedRow);
      }
    }

    return {
      mappedData,
      validationResults: {
        validRows,
        invalidRows: data.length - validRows,
        totalRows: data.length,
        errors
      }
    };
  }

  /**
   * Apply data transformation based on AI analysis
   */
  private applyTransformation(value: any, transformation: any): any {
    if (!value) return value;

    switch (transformation.action) {
      case 'format_phone':
        return this.formatPhoneNumber(value);
      case 'format_date':
        return this.formatDate(value);
      case 'normalize_text':
        return this.normalizeText(value);
      case 'parse_number':
        return this.parseNumber(value);
      case 'standardize_address':
        return this.standardizeAddress(value);
      default:
        return value;
    }
  }

  /**
   * Prepare data for specific target table
   */
  private async prepareDataForTable(
    mappedData: any[],
    targetTable: string,
    analysisResult: AIAnalysisResult,
    associationId: string
  ): Promise<any[]> {
    const tableData = mappedData.map(row => {
      const tableRow = { ...row };
      
      // Add association_id only to tables that have this field
      const tablesWithAssociationId = ['properties', 'residents', 'assessments', 'maintenance_requests', 'vendors'];
      if (tablesWithAssociationId.includes(targetTable)) {
        tableRow.association_id = associationId;
      }
      
      // Add table-specific fields based on target table
      switch (targetTable) {
        case 'properties':
          if (!tableRow.account_number) {
            tableRow.account_number = this.generateAccountNumber();
          }
          if (!tableRow.property_type) {
            tableRow.property_type = 'residential';
          }
          if (!tableRow.status) {
            tableRow.status = 'active';
          }
          break;
        case 'homeowners':
          // Homeowners table doesn't have association_id, but needs other defaults
          if (!tableRow.account_number) {
            tableRow.account_number = this.generateAccountNumber();
          }
          if (!tableRow.status) {
            tableRow.status = 'active';
          }
          if (!tableRow.current_balance) {
            tableRow.current_balance = 0;
          }
          break;
        case 'residents':
          if (!tableRow.move_in_date && tableRow.move_in) {
            tableRow.move_in_date = this.formatDate(tableRow.move_in);
          }
          if (!tableRow.status) {
            tableRow.status = 'active';
          }
          break;
        case 'assessments':
          if (!tableRow.due_date) {
            tableRow.due_date = new Date().toISOString().split('T')[0];
          }
          if (!tableRow.payment_status) {
            tableRow.payment_status = 'unpaid';
          }
          break;
      }

      return tableRow;
    });

    return tableData;
  }

  /**
   * Import data to specific table
   */
  private async importToTable(
    tableName: string,
    data: any[],
    associationId: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const result = { success: 0, failed: 0, errors: [] as string[] };

    try {
      // Use specific table methods based on table name to maintain type safety
      let insertResult;
      
      switch (tableName) {
        case 'properties':
          insertResult = await supabase.from('properties').insert(data).select();
          break;
        case 'homeowners':
          insertResult = await supabase.from('homeowners').insert(data).select();
          break;
        case 'residents':
          insertResult = await supabase.from('residents').insert(data).select();
          break;
        case 'assessments':
          insertResult = await supabase.from('assessments').insert(data).select();
          break;
        case 'maintenance_requests':
          insertResult = await supabase.from('maintenance_requests').insert(data).select();
          break;
        case 'vendors':
          insertResult = await supabase.from('vendors').insert(data).select();
          break;
        default:
          throw new Error(`Unsupported table: ${tableName}. Supported tables: properties, homeowners, residents, assessments, maintenance_requests, vendors`);
      }

      const { data: insertedData, error } = insertResult;

      if (error) {
        result.errors.push(`Table ${tableName}: ${error.message}`);
        result.failed = data.length;
      } else {
        result.success = insertedData?.length || 0;
      }

    } catch (error) {
      result.errors.push(`Table ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.failed = data.length;
    }

    return result;
  }

  /**
   * Process relationships between imported data
   */
  private async processRelationships(
    relationships: Array<{ type: string; description: string }>,
    associationId: string
  ): Promise<void> {
    // This would implement relationship processing
    // For example, linking residents to properties
    console.log('Processing relationships:', relationships);
  }

  // Utility methods for data transformation
  private formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }

  private formatDate(date: string): string {
    try {
      const parsed = new Date(date);
      return parsed.toISOString().split('T')[0];
    } catch {
      return date;
    }
  }

  private normalizeText(text: string): string {
    return text.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private parseNumber(value: string): number | null {
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? null : parsed;
  }

  private standardizeAddress(address: string): string {
    return address
      .replace(/\bSt\b/gi, 'Street')
      .replace(/\bAve\b/gi, 'Avenue')
      .replace(/\bDr\b/gi, 'Drive')
      .replace(/\bRd\b/gi, 'Road')
      .trim();
  }

  private generateAccountNumber(): string {
    return 'ACC' + Math.random().toString().slice(2, 8);
  }

  /**
   * Validate analysis result before processing
   */
  private validateAnalysisResult(analysisResult: AIAnalysisResult): string[] {
    const errors: string[] = [];
    
    // Check if we have valid target tables
    if (!analysisResult.targetTables || analysisResult.targetTables.length === 0) {
      errors.push('No target tables specified in analysis result');
    }
    
    // Check if we have field mappings
    if (!analysisResult.fieldMappings || Object.keys(analysisResult.fieldMappings).length === 0) {
      errors.push('No field mappings specified in analysis result');
    }
    
    // Validate that all target tables are supported
    const supportedTables = ['properties', 'homeowners', 'residents', 'assessments', 'maintenance_requests', 'vendors'];
    const unsupportedTables = analysisResult.targetTables?.filter(table => !supportedTables.includes(table));
    if (unsupportedTables && unsupportedTables.length > 0) {
      errors.push(`Unsupported tables detected: ${unsupportedTables.join(', ')}. Supported tables: ${supportedTables.join(', ')}`);
    }
    
    // Check for validation errors in the analysis result
    if (analysisResult.validation && Object.keys(analysisResult.validation.invalidMappings).length > 0) {
      errors.push('Invalid field mappings detected in analysis result');
    }
    
    return errors;
  }
}

export const aiImportExecutor = new AIImportExecutor();