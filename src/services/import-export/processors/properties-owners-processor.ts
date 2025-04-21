
import { supabase } from '@/integrations/supabase/client';
import { jobService } from '../job-service';

export const propertiesOwnersProcessor = {
  process: async (jobId: string, associationId: string, processedData: Record<string, any>[]) => {
    console.log(`Processing properties_owners import with ${processedData.length} records`);
    await jobService.updateImportJobStatus(jobId, 'validating');
    
    let successfulPropertyImports = 0;
    let successfulOwnerImports = 0;
    let failedImports = 0;
    const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];

    try {
      // First, process all properties
      const propertyData = processedData.map(row => {
        return {
          address: row.address,
          unit_number: row.unit_number,
          property_type: row.property_type || 'residential', // Default to residential if not specified
          city: row.city,
          state: row.state,
          zip: row.zip,
          square_feet: row.square_feet,
          bedrooms: row.bedrooms,
          bathrooms: row.bathrooms,
          association_id: associationId
        };
      });

      // Check if we have valid property data
      if (!propertyData.length || !propertyData[0].address) {
        details.push({
          status: 'error',
          message: 'No valid property data found in the import file'
        });
        failedImports = processedData.length;
        
        await jobService.updateImportJobStatus(jobId, 'failed', {
          processed: processedData.length,
          succeeded: 0,
          failed: failedImports,
          errorDetails: { details }
        });
        
        return {
          success: false,
          successfulImports: 0,
          failedImports,
          details
        };
      }
      
      // Process properties in batches
      const propertyBatchSize = 25;
      let propertySuccessCount = 0;
      const insertedProperties = [];
      
      for (let i = 0; i < propertyData.length; i += propertyBatchSize) {
        const batch = propertyData.slice(i, i + propertyBatchSize);
        console.log(`Inserting property batch ${Math.floor(i/propertyBatchSize) + 1} (${batch.length} records)`);
        
        try {
          const { data: batchResult, error: propertyError } = await supabase
            .from('properties')
            .insert(batch)
            .select('id, address, unit_number');
            
          if (propertyError) {
            console.error('Error importing property batch:', propertyError);
            failedImports += batch.length;
            details.push({
              status: 'error',
              message: `Failed to import property batch: ${propertyError.message || 'Database error'}`
            });
          } else if (batchResult && batchResult.length > 0) {
            propertySuccessCount += batchResult.length;
            insertedProperties.push(...batchResult);
            details.push({
              status: 'success',
              message: `Imported ${batchResult.length} properties successfully (batch ${Math.floor(i/propertyBatchSize) + 1})`
            });
          }
        } catch (err) {
          console.error('Error in property batch processing:', err);
          failedImports += batch.length;
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          details.push({
            status: 'error',
            message: `Failed to import property batch: ${errorMessage}`
          });
        }
        
        // Update job status after each batch
        await jobService.updateImportJobStatus(jobId, 'processing', {
          processed: i + batch.length,
          succeeded: propertySuccessCount,
          failed: failedImports
        });
      }
      
      successfulPropertyImports = propertySuccessCount;
      
      if (insertedProperties.length === 0) {
        details.push({
          status: 'warning',
          message: 'No properties were successfully imported'
        });
        
        await jobService.updateImportJobStatus(jobId, 'failed', {
          processed: processedData.length,
          succeeded: 0,
          failed: processedData.length,
          errorDetails: { details }
        });
        
        return {
          success: false,
          successfulImports: 0,
          failedImports: processedData.length,
          details
        };
      }
      
      // Now prepare owner data with the property IDs
      const ownerData = [];
      const propertyMap = new Map();
      
      // Create a map of properties for easier lookup
      insertedProperties.forEach(property => {
        const key = property.unit_number
          ? `${property.address}|${property.unit_number}`
          : property.address;
        propertyMap.set(key, property.id);
      });
      
      for (let i = 0; i < processedData.length; i++) {
        const row = processedData[i];
        
        // Create a lookup key that matches our map
        const lookupKey = row.unit_number
          ? `${row.address}|${row.unit_number}`
          : row.address;
          
        const propertyId = propertyMap.get(lookupKey);
        
        if (propertyId) {
          // Only add owner if first name or last name exists
          if (row.first_name || row.last_name) {
            // Combine first_name and last_name into name field since residents table has name, not first_name/last_name
            const name = `${row.first_name || ''} ${row.last_name || ''}`.trim();
            
            ownerData.push({
              property_id: propertyId,
              resident_type: 'owner',
              name: name, // Use combined name format
              email: row.email,
              phone: row.phone,
              move_in_date: row.move_in_date,
              is_primary: row.is_primary === 'true' || row.is_primary === true,
              emergency_contact: row.emergency_contact
            });
          }
        } else {
          failedImports++;
          details.push({
            status: 'error',
            message: `Could not find matching property for address: ${row.address}${row.unit_number ? `, Unit ${row.unit_number}` : ''}`
          });
        }
      }
      
      // Process owners in batches
      if (ownerData.length > 0) {
        const ownerBatchSize = 25;
        let ownerSuccessCount = 0;
        
        for (let i = 0; i < ownerData.length; i += ownerBatchSize) {
          const batch = ownerData.slice(i, i + ownerBatchSize);
          console.log(`Inserting owner batch ${Math.floor(i/ownerBatchSize) + 1} (${batch.length} records)`);
          
          try {
            const { data: batchResult, error: ownerError } = await supabase
              .from('residents')
              .insert(batch)
              .select('id');
              
            if (ownerError) {
              console.error('Error importing owner batch:', ownerError);
              failedImports += batch.length;
              details.push({
                status: 'error',
                message: `Failed to import owner batch: ${ownerError.message || 'Database error'}`
              });
            } else if (batchResult && batchResult.length > 0) {
              ownerSuccessCount += batchResult.length;
              details.push({
                status: 'success',
                message: `Imported ${batchResult.length} owners successfully (batch ${Math.floor(i/ownerBatchSize) + 1})`
              });
            }
          } catch (err) {
            console.error('Error in owner batch processing:', err);
            failedImports += batch.length;
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            details.push({
              status: 'error',
              message: `Failed to import owner batch: ${errorMessage}`
            });
          }
          
          // Update job status after each batch
          await jobService.updateImportJobStatus(jobId, 'processing', {
            processed: propertyData.length + i + batch.length,
            succeeded: successfulPropertyImports + ownerSuccessCount,
            failed: failedImports
          });
        }
        
        successfulOwnerImports = ownerSuccessCount;
      } else {
        details.push({
          status: 'warning',
          message: 'No owner data was found to import'
        });
      }
      
      await jobService.updateImportJobStatus(jobId, successfulPropertyImports > 0 ? 'completed' : 'failed', {
        processed: processedData.length,
        succeeded: successfulPropertyImports + successfulOwnerImports,
        failed: failedImports
      });
      
      return {
        success: failedImports === 0 && (successfulPropertyImports > 0 || successfulOwnerImports > 0),
        successfulImports: successfulPropertyImports + successfulOwnerImports,
        failedImports,
        details
      };
    } catch (e) {
      console.error('Error in properties_owners import:', e);
      failedImports += processedData.length;
      
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      details.push({
        status: 'error',
        message: `Failed to import data: ${errorMessage}`
      });
      
      await jobService.updateImportJobStatus(jobId, 'failed', {
        processed: processedData.length,
        succeeded: 0,
        failed: failedImports,
        errorDetails: { message: errorMessage }
      });
      
      return {
        success: false,
        successfulImports: 0,
        failedImports,
        details
      };
    }
  }
};
