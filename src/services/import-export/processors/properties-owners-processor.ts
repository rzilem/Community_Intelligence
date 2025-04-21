
import { supabase } from '@/integrations/supabase/client';
import { jobService } from '../job-service';
import { propertyProcessor } from './property-processor';
import { ownerProcessor } from './owner-processor';
import { ProcessorResult, PropertyData, OwnerData } from './types';

const BATCH_SIZE = 25;

export const propertiesOwnersProcessor = {
  process: async (
    jobId: string, 
    associationId: string, 
    processedData: Record<string, any>[]
  ): Promise<ProcessorResult> => {
    console.log(`Processing properties_owners import with ${processedData.length} records`);
    await jobService.updateImportJobStatus(jobId, 'validating');
    
    let successfulPropertyImports = 0;
    let successfulOwnerImports = 0;
    let failedImports = 0;
    const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];

    try {
      // Prepare property data
      const propertyData: PropertyData[] = processedData.map(row => ({
        address: row.address || '',
        unit_number: row.unit_number,
        property_type: row.property_type || 'residential',
        city: row.city,
        state: row.state,
        zip: row.zip,
        square_feet: row.square_feet,
        bedrooms: row.bedrooms,
        bathrooms: row.bathrooms,
        association_id: associationId
      }));

      if (!propertyData.length || !propertyData[0].address) {
        const error = { 
          success: false,
          successfulImports: 0,
          failedImports: processedData.length,
          details: [{
            status: 'error' as const,
            message: 'No valid property data found in the import file'
          }],
          totalProcessed: processedData.length
        };
        await handleFailure(jobId, processedData.length, error.details);
        return error;
      }

      // Process properties in batches
      const insertedProperties = [];
      for (let i = 0; i < propertyData.length; i += BATCH_SIZE) {
        const batch = propertyData.slice(i, i + BATCH_SIZE);
        const batchIndex = Math.floor(i/BATCH_SIZE);
        
        const { properties, successCount, details: batchDetails } = 
          await propertyProcessor.processBatch(batch, batchIndex, jobId);
        
        successfulPropertyImports += successCount;
        details.push(...batchDetails);
        insertedProperties.push(...properties);
        
        await jobService.updateImportJobStatus(jobId, 'processing', {
          processed: i + batch.length,
          succeeded: successfulPropertyImports,
          failed: failedImports
        });
      }

      if (insertedProperties.length === 0) {
        const error = {
          success: false,
          successfulImports: 0,
          failedImports: processedData.length,
          details: [{
            status: 'warning' as const,
            message: 'No properties were successfully imported'
          }],
          totalProcessed: processedData.length
        };
        await handleFailure(jobId, processedData.length, error.details);
        return error;
      }

      // Create property lookup map
      const propertyMap = new Map();
      insertedProperties.forEach(property => {
        const key = property.unit_number
          ? `${property.address}|${property.unit_number}`
          : property.address;
        propertyMap.set(key, property.id);
      });

      // Prepare owner data
      const ownerData = prepareOwnerData(processedData, propertyMap);

      // Process owners in batches
      if (ownerData.length > 0) {
        for (let i = 0; i < ownerData.length; i += BATCH_SIZE) {
          const batch = ownerData.slice(i, i + BATCH_SIZE);
          const batchIndex = Math.floor(i/BATCH_SIZE);
          
          const { successCount, details: batchDetails } = 
            await ownerProcessor.processBatch(batch, batchIndex);
          
          successfulOwnerImports += successCount;
          details.push(...batchDetails);
          
          await jobService.updateImportJobStatus(jobId, 'processing', {
            processed: propertyData.length + i + batch.length,
            succeeded: successfulPropertyImports + successfulOwnerImports,
            failed: failedImports
          });
        }
      } else {
        details.push({
          status: 'warning',
          message: 'No owner data was found to import'
        });
      }

      const success = failedImports === 0 && (successfulPropertyImports > 0 || successfulOwnerImports > 0);
      await jobService.updateImportJobStatus(jobId, success ? 'completed' : 'failed', {
        processed: processedData.length,
        succeeded: successfulPropertyImports + successfulOwnerImports,
        failed: failedImports
      });

      return {
        success,
        successfulImports: successfulPropertyImports + successfulOwnerImports,
        failedImports,
        details,
        totalProcessed: processedData.length
      };

    } catch (e) {
      console.error('Error in properties_owners import:', e);
      const error = {
        success: false,
        successfulImports: 0,
        failedImports: processedData.length,
        details: [{
          status: 'error' as const,
          message: `Failed to import data: ${e instanceof Error ? e.message : 'Unknown error'}`
        }],
        totalProcessed: processedData.length
      };
      await handleFailure(jobId, processedData.length, error.details);
      return error;
    }
  }
};

// Helper functions as standalone functions rather than private methods
function prepareOwnerData(
  processedData: Record<string, any>[],
  propertyMap: Map<string, string>
): OwnerData[] {
  const ownerData: OwnerData[] = [];

  processedData.forEach((row) => {
    // Create lookup key
    const lookupKey = row.unit_number
      ? `${row.address}|${row.unit_number}`
      : row.address;
      
    const propertyId = propertyMap.get(lookupKey);
    
    if (propertyId && (row.first_name || row.last_name)) {
      ownerData.push({
        name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
        email: row.email,
        phone: row.phone,
        resident_type: 'owner',
        property_id: propertyId,
        move_in_date: row.move_in_date,
        is_primary: row.is_primary === 'true' || row.is_primary === true,
        emergency_contact: row.emergency_contact
      });
    }
  });

  return ownerData;
}

async function handleFailure(
  jobId: string,
  totalRecords: number,
  details: Array<{ status: 'success' | 'error' | 'warning'; message: string }>
): Promise<void> {
  await jobService.updateImportJobStatus(jobId, 'failed', {
    processed: totalRecords,
    succeeded: 0,
    failed: totalRecords,
    errorDetails: { details }
  });
}
