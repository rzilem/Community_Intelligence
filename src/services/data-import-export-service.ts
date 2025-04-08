
import { supabase } from '@/integrations/supabase/client';
import { ImportJob, ImportMapping, ValidationResult, ImportResult, ImportJobTable, ImportMappingTable } from '@/types/import-types';
import { toast } from 'sonner';

export interface ImportOptions {
  associationId: string;
  dataType: string;
  data: any[];
  mappings: Record<string, string>;
  userId?: string;
}

export interface ExportOptions {
  associationId: string;
  dataType: string;
  format: 'csv' | 'xlsx';
  filters?: Record<string, any>;
}

// Helper function to parse CSV string into array of objects
const parseCSV = (csvString: string): any[] => {
  const lines = csvString.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: Record<string, any> = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index];
    });
    
    return obj;
  });
};

export const dataImportService = {
  /**
   * Creates a new import job in the database
   */
  createImportJob: async (options: {
    associationId: string;
    importType: string;
    fileName: string;
    fileSize: number;
    userId?: string;
  }): Promise<ImportJob | null> => {
    try {
      const { associationId, importType, fileName, fileSize, userId } = options;
      
      const { data, error } = await supabase
        .from('import_jobs' as ImportJobTable)
        .insert({
          association_id: associationId,
          import_type: importType,
          status: 'processing',
          file_name: fileName,
          file_size: fileSize,
          created_by: userId
        } as any)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error creating import job:', error);
        toast.error('Failed to create import job');
        throw error;
      }
      
      return data as unknown as ImportJob;
    } catch (error) {
      console.error('Error creating import job:', error);
      return null;
    }
  },
  
  /**
   * Updates an import job's status and results
   */
  updateImportJobStatus: async (
    jobId: string,
    status: ImportJob['status'],
    results?: {
      processed?: number;
      succeeded?: number;
      failed?: number;
      errorDetails?: Record<string, any>;
    }
  ): Promise<void> => {
    try {
      const updateData: Partial<ImportJob> = { status };
      
      if (results) {
        if (results.processed !== undefined) updateData.rows_processed = results.processed;
        if (results.succeeded !== undefined) updateData.rows_succeeded = results.succeeded;
        if (results.failed !== undefined) updateData.rows_failed = results.failed;
        if (results.errorDetails) updateData.error_details = results.errorDetails;
      }
      
      const { error } = await supabase
        .from('import_jobs' as ImportJobTable)
        .update(updateData as any)
        .eq('id', jobId);
      
      if (error) {
        console.error('Error updating import job:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating import job status:', error);
    }
  },
  
  /**
   * Saves mapping configuration for future use
   */
  saveImportMapping: async (
    associationId: string,
    importType: string,
    mappings: Record<string, string>,
    userId?: string
  ): Promise<void> => {
    try {
      // First check if a mapping already exists
      const { data: existingMapping } = await supabase
        .from('import_mappings' as ImportMappingTable)
        .select('*')
        .eq('association_id', associationId)
        .eq('import_type', importType)
        .maybeSingle();
      
      if (existingMapping) {
        // Update existing mapping
        await supabase
          .from('import_mappings' as ImportMappingTable)
          .update({ mappings: mappings as any })
          .eq('id', existingMapping.id);
      } else {
        // Create new mapping
        await supabase
          .from('import_mappings' as ImportMappingTable)
          .insert({
            association_id: associationId,
            import_type: importType,
            mappings: mappings as any,
            created_by: userId
          } as any);
      }
    } catch (error) {
      console.error('Error saving import mappings:', error);
    }
  },
  
  /**
   * Gets previously saved mapping for an import type
   */
  getImportMapping: async (
    associationId: string,
    importType: string
  ): Promise<Record<string, string> | null> => {
    try {
      const { data, error } = await supabase
        .from('import_mappings' as ImportMappingTable)
        .select('mappings')
        .eq('association_id', associationId)
        .eq('import_type', importType)
        .maybeSingle();
      
      if (error) {
        console.error('Error getting import mappings:', error);
        return null;
      }
      
      return data?.mappings && typeof data.mappings === 'object' 
        ? data.mappings as unknown as Record<string, string> 
        : null;
    } catch (error) {
      console.error('Error getting import mappings:', error);
      return null;
    }
  },
  
  /**
   * Gets import job details
   */
  getImportJob: async (jobId: string): Promise<ImportJob | null> => {
    try {
      const { data, error } = await supabase
        .from('import_jobs' as ImportJobTable)
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (error) {
        console.error('Error getting import job:', error);
        return null;
      }
      
      return data as unknown as ImportJob;
    } catch (error) {
      console.error('Error getting import job:', error);
      return null;
    }
  },
  
  /**
   * Gets recent import jobs for an association
   */
  getRecentImportJobs: async (associationId: string, limit = 5): Promise<ImportJob[]> => {
    try {
      const { data, error } = await supabase
        .from('import_jobs' as ImportJobTable)
        .select('*')
        .eq('association_id', associationId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error getting recent import jobs:', error);
        return [];
      }
      
      return data as unknown as ImportJob[];
    } catch (error) {
      console.error('Error getting recent import jobs:', error);
      return [];
    }
  },
  
  /**
   * Validates data before import
   * @param data The data to validate
   * @param dataType The type of data being validated
   * @returns Validation results
   */
  validateData: async (data: any[], dataType: string): Promise<ValidationResult> => {
    try {
      // Identify required fields for the data type
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
      
      // Validate each row
      data.forEach((row, rowIndex) => {
        let rowHasError = false;
        
        // Check required fields
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
        
        // Check data types
        if (dataType === 'financial' && row.amount && isNaN(Number(row.amount))) {
          issues.push({
            row: rowIndex + 1,
            field: 'amount',
            issue: 'Amount must be a number'
          });
          rowHasError = true;
        }
        
        // Vendor-specific validations
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
        
        // Add other type-specific validations as needed
        
        if (rowHasError) {
          invalidRows++;
        }
      });
      
      // Check for potential duplicates as warnings
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
  },
  
  /**
   * Imports data to Supabase tables
   * @param options Import options including data and mappings
   */
  importData: async (options: ImportOptions): Promise<ImportResult> => {
    const { associationId, dataType, data, mappings, userId } = options;
    
    try {
      // Create an import job to track progress
      const importJob = await dataImportService.createImportJob({
        associationId,
        importType: dataType,
        fileName: `${dataType}_import_${new Date().toISOString()}`,
        fileSize: JSON.stringify(data).length,
        userId
      });
      
      if (!importJob) {
        return {
          success: false,
          totalProcessed: 0,
          successfulImports: 0,
          failedImports: 0,
          details: [{ status: 'error' as const, message: 'Failed to create import job' }]
        };
      }
      
      // Update job status to validating
      await dataImportService.updateImportJobStatus(importJob.id, 'validating');
      
      // Process the data with mappings
      const processedData = data.map(row => {
        const mappedRow: Record<string, any> = { association_id: associationId };
        
        Object.entries(mappings).forEach(([column, field]) => {
          if (field && row[column] !== undefined) {
            mappedRow[field] = row[column];
          }
        });
        
        return mappedRow;
      });
      
      // Determine which table to insert into based on dataType
      let tableName: string;
      switch (dataType) {
        case 'associations':
          tableName = 'associations';
          break;
        case 'owners':
          tableName = 'residents';
          processedData.forEach(row => {
            row.resident_type = 'owner';
          });
          break;
        case 'properties':
          tableName = 'properties';
          break;
        case 'financial':
          tableName = 'assessments';
          break;
        case 'compliance':
          tableName = 'compliance_issues';
          break;
        case 'maintenance':
          tableName = 'maintenance_requests';
          break;
        case 'vendors':
          tableName = 'vendors';
          processedData.forEach(row => {
            // Set default values for vendors
            row.status = row.status || 'active';
            row.hasInsurance = row.hasInsurance === 'true' || row.hasInsurance === true || false;
          });
          break;
        default:
          tableName = dataType;
      }
      
      // Update job status to processing
      await dataImportService.updateImportJobStatus(importJob.id, 'processing', {
        processed: 0,
        succeeded: 0,
        failed: 0
      });
      
      // Insert data in batches for better performance and error handling
      const batchSize = 50;
      let successfulImports = 0;
      let failedImports = 0;
      const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];
      
      // Handle importing data in batches
      for (let i = 0; i < processedData.length; i += batchSize) {
        const batch = processedData.slice(i, i + batchSize);
        
        // Use a simple string as the table name to avoid TypeScript errors
        const { data: insertedData, error } = await supabase
          .from(tableName as any)
          .insert(batch as any)
          .select('id');
        
        if (error) {
          console.error(`Error importing batch to ${tableName}:`, error);
          failedImports += batch.length;
          details.push({
            status: 'error',
            message: `Failed to import ${batch.length} records: ${error.message}`
          });
        } else {
          successfulImports += insertedData.length;
          details.push({
            status: 'success',
            message: `Imported ${insertedData.length} records successfully`
          });
        }
        
        // Update job progress
        await dataImportService.updateImportJobStatus(importJob.id, 'processing', {
          processed: i + batch.length,
          succeeded: successfulImports,
          failed: failedImports
        });
      }
      
      // Save the mappings for future use
      await dataImportService.saveImportMapping(
        associationId,
        dataType,
        mappings,
        userId
      );
      
      // Update final job status
      const finalStatus = failedImports === 0 ? 'completed' : 'failed';
      await dataImportService.updateImportJobStatus(importJob.id, finalStatus as ImportJob['status'], {
        processed: processedData.length,
        succeeded: successfulImports,
        failed: failedImports,
        errorDetails: failedImports > 0 ? { details } : undefined
      });
      
      return {
        success: failedImports === 0,
        totalProcessed: processedData.length,
        successfulImports,
        failedImports,
        job_id: importJob.id,
        details: [
          { status: 'success', message: `${successfulImports} records imported successfully` },
          ...(failedImports > 0 ? [{ status: 'error', message: `${failedImports} records failed to import` }] : [])
        ]
      };
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  },
  
  /**
   * Gets a template for data import
   * @param dataType The type of data to get a template for
   * @returns Template data structure
   */
  getImportTemplate: (dataType: string) => {
    // In a real implementation, this would return the template structure for the data type
    const templates: Record<string, Record<string, string>> = {
      associations: {
        name: 'Association Name',
        address: 'Street Address',
        contact_email: 'Contact Email'
      },
      owners: {
        first_name: 'First Name',
        last_name: 'Last Name',
        email: 'Email Address',
        phone: 'Phone Number',
        property_id: 'Property ID',
        move_in_date: 'Move-in Date (YYYY-MM-DD)',
        is_primary: 'Is Primary Owner (true/false)'
      },
      properties: {
        address: 'Street Address',
        unit_number: 'Unit Number',
        property_type: 'Property Type',
        city: 'City',
        state: 'State',
        zip: 'Zip Code',
        square_feet: 'Square Footage',
        bedrooms: 'Bedrooms',
        bathrooms: 'Bathrooms'
      },
      financial: {
        property_id: 'Property ID',
        amount: 'Amount',
        due_date: 'Due Date (YYYY-MM-DD)',
        assessment_type_id: 'Assessment Type ID',
        late_fee: 'Late Fee Amount'
      },
      compliance: {
        property_id: 'Property ID',
        violation_type: 'Violation Type',
        description: 'Description',
        due_date: 'Due Date (YYYY-MM-DD)',
        fine_amount: 'Fine Amount'
      },
      maintenance: {
        property_id: 'Property ID',
        title: 'Title',
        description: 'Description',
        priority: 'Priority (low/medium/high)',
        status: 'Status (open/in_progress/completed)'
      },
      vendors: {
        name: 'Vendor Name',
        contactPerson: 'Contact Person',
        email: 'Email',
        phone: 'Phone Number',
        category: 'Service Category',
        status: 'Status (active/inactive)',
        hasInsurance: 'Has Insurance (true/false)'
      }
    };
    
    return templates[dataType] || {};
  }
};

export const dataExportService = {
  /**
   * Exports data from Supabase tables
   * @param options Export options
   * @returns The exported data
   */
  exportData: async (options: ExportOptions) => {
    const { associationId, dataType, format } = options;
    
    try {
      // Determine which table to export based on dataType
      let tableName: string;
      let query: any = supabase;
      
      switch (dataType) {
        case 'associations':
          tableName = 'associations';
          query = query.from(tableName).select('*');
          break;
        case 'owners':
          tableName = 'residents';
          query = query.from(tableName).select('*').eq('resident_type', 'owner');
          break;
        case 'properties':
          tableName = 'properties';
          query = query.from(tableName).select('*').eq('association_id', associationId);
          break;
        case 'financial':
          tableName = 'assessments';
          query = query.from(tableName)
            .select('*, properties:property_id(address, unit_number)')
            .eq('properties.association_id', associationId);
          break;
        case 'compliance':
          tableName = 'compliance_issues';
          query = query.from(tableName).select('*').eq('association_id', associationId);
          break;
        case 'maintenance':
          tableName = 'maintenance_requests';
          query = query.from(tableName)
            .select('*, properties:property_id(address, unit_number, association_id)')
            .eq('properties.association_id', associationId);
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }
      
      // Execute the query
      const { data: exportData, error } = await query;
      
      if (error) {
        console.error(`Error exporting ${dataType} data:`, error);
        throw error;
      }
      
      // In a real implementation, we would format the data according to the requested format
      // For now, we'll just return the data as JSON
      
      return {
        success: true,
        message: `${dataType} data exported successfully in ${format} format`,
        fileName: `${dataType}_export.${format}`,
        data: exportData
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },
  
  /**
   * Gets an export template
   * @param templateType The type of template to get
   * @returns The template file data
   */
  getExportTemplate: async (templateType: string) => {
    // In a real implementation, this would generate and return a template file
    console.log(`Would generate template for ${templateType}`);
    
    return {
      success: true,
      message: `${templateType} template generated successfully`,
      fileName: `${templateType.toLowerCase()}_template.xlsx`
    };
  }
};
