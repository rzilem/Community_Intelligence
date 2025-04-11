
import { supabase } from '@/integrations/supabase/client';
import { ImportResult } from '@/types/import-types';
import { jobService } from './job-service';

export const processorService = {
  processImportData: async (
    jobId: string,
    associationId: string,
    dataType: string,
    processedData: Record<string, any>[]
  ): Promise<{
    success: boolean;
    successfulImports: number;
    failedImports: number;
    details: Array<{ status: 'success' | 'error' | 'warning'; message: string }>;
  }> => {
    let tableName: string;
    
    // Special handling for properties_owners combined import
    if (dataType === 'properties_owners') {
      return await processPropertiesOwnersImport(jobId, associationId, processedData);
    }
    
    switch (dataType) {
      case 'associations':
        tableName = 'associations';
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
          row.status = row.status || 'active';
          row.hasInsurance = row.hasInsurance === 'true' || row.hasInsurance === true || false;
        });
        break;
      default:
        tableName = dataType;
    }
    
    await jobService.updateImportJobStatus(jobId, 'validating');
    
    const batchSize = 50;
    let successfulImports = 0;
    let failedImports = 0;
    const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];
    
    // Process data by adding association_id to non-association tables
    const finalProcessedData = processedData.map(row => {
      // Don't add association_id when importing associations
      if (dataType === 'associations') {
        return { ...row };
      }
      // Add association_id to all other tables if not already present
      if (!row.association_id) {
        return { ...row, association_id: associationId };
      }
      return { ...row };
    });
    
    for (let i = 0; i < finalProcessedData.length; i += batchSize) {
      const batch = finalProcessedData.slice(i, i + batchSize);
      
      try {
        console.log(`Importing batch to ${tableName}:`, batch);
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
        details.push({
          status: 'error',
          message: `Failed to import ${batch.length} records: ${e instanceof Error ? e.message : 'Unknown error'}`
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

// Helper function to process combined properties and owners import
async function processPropertiesOwnersImport(
  jobId: string,
  associationId: string,
  processedData: Record<string, any>[]
): Promise<{
  success: boolean;
  successfulImports: number;
  failedImports: number;
  details: Array<{ status: 'success' | 'error' | 'warning'; message: string }>;
}> {
  await jobService.updateImportJobStatus(jobId, 'validating');
  
  let successfulPropertyImports = 0;
  let successfulOwnerImports = 0;
  let failedImports = 0;
  const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];

  // First, process all properties
  const propertyData = processedData.map(row => {
    return {
      address: row.address,
      unit_number: row.unit_number,
      property_type: row.property_type,
      city: row.city,
      state: row.state,
      zip: row.zip,
      square_feet: row.square_feet,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      association_id: associationId
    };
  });

  try {
    // Insert properties
    const { data: insertedProperties, error: propertyError } = await supabase
      .from('properties')
      .insert(propertyData)
      .select('id, address, unit_number');
    
    if (propertyError) {
      console.error('Error importing properties:', propertyError);
      failedImports += processedData.length;
      details.push({
        status: 'error', 
        message: `Failed to import properties: ${propertyError.message}`
      });
      
      return {
        success: false,
        successfulImports: 0,
        failedImports,
        details
      };
    }
    
    if (!insertedProperties || insertedProperties.length === 0) {
      details.push({
        status: 'warning',
        message: 'No properties were imported'
      });
      return {
        success: false,
        successfulImports: 0,
        failedImports: processedData.length,
        details
      };
    }
    
    successfulPropertyImports = insertedProperties.length;
    details.push({
      status: 'success',
      message: `Imported ${insertedProperties.length} properties successfully`
    });
    
    // Now prepare owner data with the property IDs
    const ownerData = [];
    for (let i = 0; i < processedData.length; i++) {
      if (insertedProperties[i]) {
        const row = processedData[i];
        // Only add owner if first name or last name exists
        if (row.first_name || row.last_name) {
          ownerData.push({
            property_id: insertedProperties[i].id,
            resident_type: 'owner',
            name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            phone: row.phone,
            move_in_date: row.move_in_date,
            is_primary: row.is_primary === 'true' || row.is_primary === true,
            emergency_contact: row.emergency_contact
          });
        }
      }
    }
    
    if (ownerData.length > 0) {
      // Insert owners
      const { data: insertedOwners, error: ownerError } = await supabase
        .from('residents')
        .insert(ownerData)
        .select('id');
      
      if (ownerError) {
        console.error('Error importing owners:', ownerError);
        details.push({
          status: 'error',
          message: `Failed to import owners: ${ownerError.message}`
        });
        failedImports += ownerData.length;
      } else if (insertedOwners) {
        successfulOwnerImports = insertedOwners.length;
        details.push({
          status: 'success',
          message: `Imported ${insertedOwners.length} owners successfully`
        });
      }
    } else {
      details.push({
        status: 'warning',
        message: 'No owner data was found to import'
      });
    }
    
    await jobService.updateImportJobStatus(jobId, 'completed', {
      processed: processedData.length,
      succeeded: successfulPropertyImports + successfulOwnerImports,
      failed: failedImports
    });
    
    return {
      success: failedImports === 0,
      successfulImports: successfulPropertyImports + successfulOwnerImports,
      failedImports,
      details
    };
  } catch (e) {
    console.error('Error in properties_owners import:', e);
    failedImports += processedData.length;
    
    details.push({
      status: 'error',
      message: `Failed to import data: ${e instanceof Error ? e.message : 'Unknown error'}`
    });
    
    await jobService.updateImportJobStatus(jobId, 'failed', {
      processed: processedData.length,
      succeeded: 0,
      failed: failedImports,
      errorDetails: { message: e instanceof Error ? e.message : 'Unknown error' }
    });
    
    return {
      success: false,
      successfulImports: 0,
      failedImports,
      details
    };
  }
}
