import { supabase } from '@/integrations/supabase/client';
import { jobService } from '../job-service';

export const propertiesOwnersProcessor = {
  process: async (jobId: string, associationId: string, processedData: Record<string, any>[]) => {
    await jobService.updateImportJobStatus(jobId, 'processing');
    
    const batchSize = 25;
    let successfulImports = 0;
    let failedImports = 0;
    const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];
    
    for (let i = 0; i < processedData.length; i += batchSize) {
      const batch = processedData.slice(i, i + batchSize);
      
      try {
        console.log(`Processing properties & owners batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)`);
        
        for (const record of batch) {
          try {
            // First, create or find the property
            const propertyData = {
              association_id: associationId,
              address: record.address || record.property_address || record.street_address,
              property_type: record.property_type || 'single_family',
              unit_number: record.unit_number || record.unit,
              square_footage: record.square_footage ? parseFloat(record.square_footage) : null,
              bedrooms: record.bedrooms ? parseInt(record.bedrooms) : null,
              bathrooms: record.bathrooms ? parseFloat(record.bathrooms) : null,
              year_built: record.year_built ? parseInt(record.year_built) : null,
              lot_size: record.lot_size ? parseFloat(record.lot_size) : null
            };
            
            const { data: property, error: propertyError } = await supabase
              .from('properties')
              .insert(propertyData)
              .select('id')
              .single();
            
            if (propertyError) {
              throw new Error(`Property creation failed: ${propertyError.message}`);
            }
            
            // Then, create the owner/resident if owner data exists
            if (record.first_name || record.last_name || record.owner_name) {
              const ownerData = {
                association_id: associationId,
                property_id: property.id,
                first_name: record.first_name || record.owner_name?.split(' ')[0] || '',
                last_name: record.last_name || record.owner_name?.split(' ').slice(1).join(' ') || '',
                email: record.email || record.contact_email,
                phone: record.phone || record.phone_number,
                move_in_date: record.move_in_date || null,
                is_primary: record.is_primary !== undefined ? record.is_primary : true,
                emergency_contact: record.emergency_contact || null
              };
              
              const { error: ownerError } = await supabase
                .from('residents')
                .insert(ownerData);
              
              if (ownerError) {
                console.warn(`Owner creation failed for property ${property.id}:`, ownerError);
                details.push({
                  status: 'warning',
                  message: `Property created but owner creation failed: ${ownerError.message}`
                });
              }
            }
            
            successfulImports++;
          } catch (recordError) {
            console.error('Error processing record:', recordError);
            failedImports++;
            const errorMessage = recordError instanceof Error ? recordError.message : 'Unknown error';
            details.push({
              status: 'error',
              message: `Failed to import record: ${errorMessage}`
            });
          }
        }
        
        details.push({
          status: 'success',
          message: `Processed ${batch.length} property & owner records`
        });
        
      } catch (batchError) {
        console.error('Error in batch processing:', batchError);
        failedImports += batch.length;
        const errorMessage = batchError instanceof Error ? batchError.message : 'Unknown error';
        details.push({
          status: 'error',
          message: `Failed to process batch: ${errorMessage}`
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
