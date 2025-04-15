
import { supabase } from '@/integrations/supabase/client';
import { jobService } from '../job-service';

export const genericProcessor = {
  process: async (
    jobId: string, 
    associationId: string, 
    dataType: string, 
    processedData: Record<string, any>[]
  ) => {
    let tableName: string;
    
    switch (dataType) {
      case 'associations':
        tableName = 'associations';
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
          row.status = row.status || 'active';
          row.hasInsurance = row.hasInsurance === 'true' || row.hasInsurance === true || false;
        });
        break;
      case 'properties':
        tableName = 'properties';
        break;
      case 'owners':
        tableName = 'residents';
        // Handle first_name/last_name fields correctly for the residents table
        processedData.forEach(row => {
          // Set resident_type to 'owner'
          row.resident_type = 'owner';
          
          // If we have first_name and last_name, combine them into the name field
          if (row.first_name || row.last_name) {
            row.name = `${row.first_name || ''} ${row.last_name || ''}`.trim();
          }
          
          // Remove first_name and last_name as they don't exist in the schema
          delete row.first_name;
          delete row.last_name;
          
          // Remove any association_id which might cause issues if the column doesn't exist
          delete row.association_id;
        });
        break;
      default:
        tableName = dataType;
    }
    
    await jobService.updateImportJobStatus(jobId, 'validating');
    
    const batchSize = 25;
    let successfulImports = 0;
    let failedImports = 0;
    const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];
    
    // Process data by adding association_id to non-association tables
    const finalProcessedData = processedData.map(row => {
      // Don't add association_id when importing associations
      if (dataType === 'associations') {
        return { ...row };
      }
      
      // For residents table, don't add association_id as it might not exist in schema
      if (dataType === 'owners') {
        return { ...row };
      }
      
      // Add association_id to all other tables if not already present
      if (!row.association_id) {
        return { ...row, association_id: associationId };
      }
      return { ...row };
    });
    
    console.log(`Processing ${finalProcessedData.length} records for import to ${tableName}`);
    
    for (let i = 0; i < finalProcessedData.length; i += batchSize) {
      const batch = finalProcessedData.slice(i, i + batchSize);
      
      try {
        console.log(`Importing batch ${Math.floor(i/batchSize) + 1} to ${tableName} (${batch.length} records)`);
        
        // Validate the batch data
        if (!Array.isArray(batch) || batch.length === 0) {
          console.error('Empty or invalid batch data');
          failedImports += batch.length;
          details.push({
            status: 'error',
            message: `Failed to import batch: Invalid data format`
          });
          continue;
        }
        
        // Check if batch data contains required properties for the table
        const missingRequiredFields = validateRequiredFields(tableName, batch);
        if (missingRequiredFields.length > 0) {
          console.error(`Missing required fields: ${missingRequiredFields.join(', ')}`);
          failedImports += batch.length;
          details.push({
            status: 'error',
            message: `Failed to import batch: Missing required fields: ${missingRequiredFields.join(', ')}`
          });
          continue;
        }
        
        // Create a safer insert with sanitized data
        const sanitizedBatch = batch.map(item => {
          const copy = { ...item };
          
          // Specific sanitization for different tables
          if (tableName === 'residents') {
            delete copy.association_id;
            
            // Only attempt to delete these properties if they exist
            if ('first_name' in copy) delete copy.first_name;
            if ('last_name' in copy) delete copy.last_name;
          }
          
          return copy;
        });
        
        const { data: insertedData, error } = await supabase
          .from(tableName as any)
          .insert(sanitizedBatch as any)
          .select('id');
        
        if (error) {
          console.error(`Error importing batch to ${tableName}:`, error);
          failedImports += batch.length;
          details.push({
            status: 'error',
            message: `Failed to import ${batch.length} records: ${error.message || 'Database error'}`
          });
        } else if (insertedData) {
          successfulImports += insertedData.length;
          details.push({
            status: 'success',
            message: `Imported ${insertedData.length} records successfully`
          });
        }
      } catch (e) {
        console.error(`Error in batch import:`, e);
        failedImports += batch.length;
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        details.push({
          status: 'error',
          message: `Failed to import ${batch.length} records: ${errorMessage}`
        });
      }
      
      await jobService.updateImportJobStatus(jobId, 'processing', {
        processed: i + batch.length,
        succeeded: successfulImports,
        failed: failedImports
      });
    }
    
    return {
      success: failedImports === 0,
      successfulImports,
      failedImports,
      details
    };
  }
};

// Helper function to validate required fields
function validateRequiredFields(tableName: string, data: Record<string, any>[]): string[] {
  if (!data || data.length === 0) return [];
  
  const requiredFields: Record<string, string[]> = {
    properties: ['address', 'property_type'],
    residents: ['property_id', 'resident_type'],
    associations: ['name'],
    assessments: ['property_id', 'amount', 'due_date'],
    compliance_issues: ['property_id', 'violation_type', 'status'],
    maintenance_requests: ['property_id', 'title', 'description', 'status', 'priority']
  };
  
  const fields = requiredFields[tableName as keyof typeof requiredFields] || [];
  
  // Check the first row to see if required fields are present
  const firstRow = data[0];
  return fields.filter(field => !firstRow.hasOwnProperty(field) || firstRow[field] === undefined || firstRow[field] === null);
}
