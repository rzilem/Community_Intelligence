
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
      // First, process all properties with account numbers
      const propertyData = processedData.map(row => {
        // Use existing account number from CSV or generate new one
        const accountNumber = row.account_number || row['Account #'] || null;
        
        return {
          address: row.address || row['Property Address'] || row['Address'],
          unit_number: row.unit_number || row['Unit No'] || null,
          property_type: row.property_type || 'residential',
          city: row.city || row['City'],
          state: row.state || row['State'],
          zip: row.zip || row['Zip'],
          square_feet: row.square_feet,
          bedrooms: row.bedrooms,
          bathrooms: row.bathrooms,
          association_id: associationId,
          account_number: accountNumber,
          homeowner_id: row.homeowner_id || row['Homeowner ID'] || null
        };
      });

      // Filter out invalid property data
      const validPropertyData = propertyData.filter(prop => prop.address);
      
      if (validPropertyData.length === 0) {
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
      
      // Process properties in batches and generate account numbers as needed
      const propertyBatchSize = 25;
      let propertySuccessCount = 0;
      const insertedProperties = [];
      
      for (let i = 0; i < validPropertyData.length; i += propertyBatchSize) {
        const batch = validPropertyData.slice(i, i + propertyBatchSize);
        console.log(`Processing property batch ${Math.floor(i/propertyBatchSize) + 1} (${batch.length} records)`);
        
        // Generate account numbers for properties that don't have them
        for (const property of batch) {
          if (!property.account_number) {
            try {
              const { data: generatedAccountNumber, error } = await supabase
                .rpc('generate_account_number', {
                  p_association_id: associationId,
                  p_prefix: 'ACC'
                });
              
              if (error) {
                console.error('Error generating account number:', error);
                property.account_number = `ACC${Date.now()}${Math.floor(Math.random() * 1000)}`;
              } else {
                property.account_number = generatedAccountNumber;
              }
            } catch (err) {
              console.error('Error calling generate_account_number function:', err);
              property.account_number = `ACC${Date.now()}${Math.floor(Math.random() * 1000)}`;
            }
          }
        }
        
        try {
          const { data: batchResult, error: propertyError } = await supabase
            .from('properties')
            .insert(batch)
            .select('id, address, unit_number, account_number');
            
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
      
      // Now prepare owner data with the property IDs, handling multiple owners per property
      const ownerData = [];
      for (let i = 0; i < processedData.length; i++) {
        const matchingProperty = i < insertedProperties.length ? insertedProperties[i] : null;
        
        if (matchingProperty) {
          const row = processedData[i];
          
          // Primary owner
          const firstName = row.first_name || row['First Name'];
          const lastName = row.last_name || row['Last Name'];
          
          if (firstName || lastName) {
            const name = `${firstName || ''} ${lastName || ''}`.trim();
            
            ownerData.push({
              property_id: matchingProperty.id,
              resident_type: 'owner',
              name: name,
              email: row.email || row['Email'],
              phone: row.phone || row['Phone'],
              move_in_date: row.move_in_date || row['Settled Date'],
              is_primary: true,
              emergency_contact: row.emergency_contact,
              account_number: matchingProperty.account_number
            });
          }
          
          // Second owner/co-owner
          const secondFirstName = row.second_owner_first_name || row['Second Owner First Name'];
          const secondLastName = row.second_owner_last_name || row['Second Owner Last Name'];
          
          if (secondFirstName || secondLastName) {
            const secondName = `${secondFirstName || ''} ${secondLastName || ''}`.trim();
            
            ownerData.push({
              property_id: matchingProperty.id,
              resident_type: 'owner',
              name: secondName,
              email: row.email || row['Email'], // Use same email if no separate email provided
              phone: row.phone || row['Phone'], // Use same phone if no separate phone provided
              move_in_date: row.move_in_date || row['Settled Date'],
              is_primary: false,
              emergency_contact: row.emergency_contact,
              account_number: matchingProperty.account_number
            });
          }
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
            processed: validPropertyData.length + i + batch.length,
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
