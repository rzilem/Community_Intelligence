
import { TransactionManager, TransactionContext } from '../transaction-manager';
import { EnhancedErrorHandler, ImportError } from '../enhanced-error-handler';
import { jobService } from '../job-service';
import { devLog } from '@/utils/dev-logger';
import { supabase } from '@/integrations/supabase/client';

export const enhancedPropertiesOwnersProcessor = {
  process: async (jobId: string, associationId: string, processedData: Record<string, any>[]) => {
    const transactionManager = await TransactionManager.create();
    const errors: ImportError[] = [];
    let successfulImports = 0;
    let failedImports = 0;
    const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];

    try {
      await jobService.updateImportJobStatus(jobId, 'processing');
      
      const result = await transactionManager.executeWithRollback(async (context: TransactionContext) => {
        const batchSize = 10; // Smaller batches for better error handling
        
        for (let i = 0; i < processedData.length; i += batchSize) {
          const batch = processedData.slice(i, i + batchSize);
          
          devLog.info(`Processing properties & owners batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)`);
          
          for (const record of batch) {
            try {
              // Validate required fields
              if (!record.address && !record.property_address && !record.street_address) {
                throw new Error('Property address is required');
              }

              // Generate account number if not provided
              let accountNumber = record.account_number || record.account || null;
              if (!accountNumber) {
                // Generate a unique account number based on address
                const addressPart = (record.address || record.property_address || record.street_address)
                  .replace(/[^\w]/g, '')
                  .substring(0, 6)
                  .toUpperCase();
                accountNumber = `${addressPart}${Date.now().toString().slice(-4)}`;
              }

              // Create property with enhanced error handling and account number
              const propertyData = {
                association_id: associationId,
                address: record.address || record.property_address || record.street_address,
                property_type: record.property_type || 'single_family',
                unit_number: record.unit_number || record.unit || null,
                square_footage: record.square_footage ? parseFloat(record.square_footage) : null,
                bedrooms: record.bedrooms ? parseInt(record.bedrooms) : null,
                bathrooms: record.bathrooms ? parseFloat(record.bathrooms) : null,
                year_built: record.year_built ? parseInt(record.year_built) : null,
                lot_size: record.lot_size ? parseFloat(record.lot_size) : null,
                account_number: accountNumber
              };

              const property = await transactionManager.trackedInsert(context, 'properties', propertyData);
              devLog.info(`Created property: ${property.id} - ${propertyData.address} (Account: ${accountNumber})`);

              // Create owner/resident if owner data exists
              if (record.first_name || record.last_name || record.owner_name || record.homeowner) {
                try {
                  const determineResidentType = (data: any): 'owner' | 'tenant' | 'family' | 'other' => {
                    if (data.resident_type) return data.resident_type;
                    if (data.owner_type?.toLowerCase().includes('tenant')) return 'tenant';
                    if (data.is_tenant === true || data.tenant === true) return 'tenant';
                    if (data.is_owner === false) return 'tenant';
                    return 'owner';
                  };

                  // Extract name from various possible fields
                  let firstName = record.first_name || '';
                  let lastName = record.last_name || '';
                  
                  // Handle cases where name is in owner_name or homeowner field
                  if (!firstName && !lastName && (record.owner_name || record.homeowner)) {
                    const fullName = record.owner_name || record.homeowner;
                    const nameParts = fullName.split(' ');
                    firstName = nameParts[0] || '';
                    lastName = nameParts.slice(1).join(' ') || '';
                  }

                  const ownerData = {
                    property_id: property.id,
                    name: `${firstName} ${lastName}`.trim() || record.owner_name || record.homeowner,
                    email: record.email || record.contact_email || null,
                    phone: record.phone || record.phone_number || null,
                    move_in_date: record.move_in_date || null,
                    is_primary: record.is_primary !== undefined ? record.is_primary : true,
                    emergency_contact: record.emergency_contact || null,
                    resident_type: determineResidentType(record)
                  };

                  const resident = await transactionManager.trackedInsert(context, 'residents', ownerData);
                  devLog.info(`Created resident: ${resident.id} - ${ownerData.name} for property ${property.address}`);
                  
                  details.push({
                    status: 'success',
                    message: `Created resident: ${ownerData.name} for property ${property.address}`
                  });
                  
                } catch (residentError) {
                  devLog.error(`Failed to create resident for property ${property.address}:`, residentError);
                  details.push({
                    status: 'warning',
                    message: `Property created but resident creation failed for ${property.address}: ${residentError.message}`
                  });
                }
              } else {
                details.push({
                  status: 'warning',
                  message: `Property created but no owner/resident data found for ${property.address}`
                });
              }

              successfulImports++;
              
              details.push({
                status: 'success',
                message: `Created property: ${property.address} (Account: ${accountNumber})`
              });
              
            } catch (recordError) {
              const error = EnhancedErrorHandler.handleError(recordError, `Record processing`);
              errors.push(error);
              failedImports++;
              
              // Enhanced error message for duplicate key violations
              let errorMessage = error.message;
              if (error.message.includes('properties_account_number_key')) {
                errorMessage = `Property with account number "${record.account_number || record.account || 'auto-generated'}" already exists. Please use unique account numbers or remove duplicates.`;
              }
              
              details.push({
                status: 'error',
                message: `Failed to import record (${record.address || record.property_address || record.street_address || 'Unknown address'}): ${errorMessage}`
              });
            }
          }

          // Update job status after each batch
          await jobService.updateImportJobStatus(jobId, 'processing', {
            processed: i + batch.length,
            succeeded: successfulImports,
            failed: failedImports
          });
        }

        return { successfulImports, failedImports };
      });

      if (errors.length > 0) {
        const errorReport = EnhancedErrorHandler.createDetailedErrorReport(errors);
        await jobService.updateImportJobStatus(jobId, 'completed', {
          processed: processedData.length,
          succeeded: successfulImports,
          failed: failedImports,
          errorDetails: { errors: errors, report: errorReport }
        });
      } else {
        await jobService.updateImportJobStatus(jobId, 'completed', {
          processed: processedData.length,
          succeeded: successfulImports,
          failed: failedImports
        });
      }

      details.push({
        status: 'success',
        message: `Import completed: ${successfulImports} successful, ${failedImports} failed`
      });

      return {
        success: failedImports === 0,
        successfulImports,
        failedImports,
        details
      };

    } catch (error) {
      const categorizedError = EnhancedErrorHandler.handleError(error, 'Properties & Owners Import');
      
      await jobService.updateImportJobStatus(jobId, 'failed', {
        processed: processedData.length,
        succeeded: 0,
        failed: processedData.length,
        errorDetails: { error: categorizedError }
      });

      return {
        success: false,
        successfulImports: 0,
        failedImports: processedData.length,
        details: [{
          status: 'error' as const,
          message: `Import failed: ${categorizedError.message}`
        }]
      };
    }
  }
};
