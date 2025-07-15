
import { TransactionManager, TransactionContext } from '../transaction-manager';
import { EnhancedErrorHandler, ImportError } from '../enhanced-error-handler';
import { jobService } from '../job-service';
import { devLog } from '@/utils/dev-logger';
import { supabase } from '@/integrations/supabase/client';

// Helper function to parse addresses with P: and M: prefixes
const parseAddresses = (record: any) => {
  let propertyAddress = '';
  let mailingAddress = '';
  let city = '';
  let state = '';
  let zip = '';

  // Handle address field that contains both P: and M: addresses
  const addressField = record.address || record.property_address || record.street_address || '';
  
  if (addressField.includes('P:') && addressField.includes('M:')) {
    const pIndex = addressField.indexOf('P:');
    const mIndex = addressField.indexOf('M:');
    
    if (pIndex < mIndex) {
      propertyAddress = addressField.substring(pIndex + 2, mIndex).trim();
      mailingAddress = addressField.substring(mIndex + 2).trim();
    } else {
      mailingAddress = addressField.substring(mIndex + 2, pIndex).trim();
      propertyAddress = addressField.substring(pIndex + 2).trim();
    }
  } else if (addressField.includes('P:')) {
    propertyAddress = addressField.replace('P:', '').trim();
  } else if (addressField.includes('M:')) {
    mailingAddress = addressField.replace('M:', '').trim();
    propertyAddress = mailingAddress; // Use mailing as property if no P: found
  } else {
    propertyAddress = addressField;
  }

  // Extract city, state, zip from property address
  if (propertyAddress) {
    // Try to extract city, state, zip using common patterns
    const addressParts = propertyAddress.split(',').map(part => part.trim());
    if (addressParts.length >= 2) {
      const lastPart = addressParts[addressParts.length - 1];
      const zipMatch = lastPart.match(/(\d{5}(-\d{4})?)/);
      if (zipMatch) {
        zip = zipMatch[1];
        const stateCity = lastPart.replace(zipMatch[0], '').trim();
        if (stateCity) {
          const stateCityParts = stateCity.split(' ');
          if (stateCityParts.length >= 2) {
            state = stateCityParts[stateCityParts.length - 1];
            city = stateCityParts.slice(0, -1).join(' ');
          } else {
            state = stateCity;
          }
        }
      }
    }
  }

  return { propertyAddress, mailingAddress, city, state, zip };
};

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
        const batchSize = 10;
        
        for (let i = 0; i < processedData.length; i += batchSize) {
          const batch = processedData.slice(i, i + batchSize);
          
          devLog.info(`Processing properties & owners batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)`);
          
          for (const record of batch) {
            try {
              devLog.info('Processing record:', record);
              
              // Parse addresses with P: and M: handling
              const { propertyAddress, mailingAddress, city, state, zip } = parseAddresses(record);
              
              if (!propertyAddress) {
                throw new Error('Property address is required');
              }

              // Map account number from various possible field names
              let accountNumber = record.account_number || 
                                record.account || 
                                record.homeowner_id || 
                                record['Account #'] || 
                                record['Homeowner ID'] || 
                                null;
              
              // Generate account number if still not found
              if (!accountNumber) {
                const addressPart = propertyAddress.replace(/[^\w]/g, '').substring(0, 6).toUpperCase();
                accountNumber = `${addressPart}${Date.now().toString().slice(-4)}`;
              }

              // Create property with enhanced address parsing
              const propertyData = {
                association_id: associationId,
                address: propertyAddress,
                city: city || record.city || null,
                state: state || record.state || null,
                zip: zip || record.zip || record.zip_code || null,
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
              devLog.info(`Created property: ${property.id} - ${propertyAddress} (Account: ${accountNumber})`);

              // Create resident - check for various name field formats
              const homeownerName = record.homeowner || record.Homeowner || record.owner_name || record.first_name || record.last_name;
              const email = record.email || record.Email || record.contact_email || null;
              const phone = record.phone || record.Phone || record.phone_number || null;
              const balance = record.balance || record.Balance || record.current_balance || null;

              if (homeownerName || record.first_name || record.last_name) {
                try {
                  const determineResidentType = (data: any): 'owner' | 'tenant' | 'family' | 'other' => {
                    if (data.resident_type) return data.resident_type;
                    if (data.owner_type?.toLowerCase().includes('tenant')) return 'tenant';
                    if (data.is_tenant === true || data.tenant === true) return 'tenant';
                    if (data.is_owner === false) return 'tenant';
                    return 'owner';
                  };

                  // Extract name from various possible fields with improved parsing
                  let firstName = record.first_name || '';
                  let lastName = record.last_name || '';
                  
                  // Handle cases where name is in homeowner or owner_name field
                  if (!firstName && !lastName && homeownerName) {
                    const fullName = homeownerName.toString().trim();
                    const nameParts = fullName.split(' ').filter(part => part.length > 0);
                    firstName = nameParts[0] || '';
                    lastName = nameParts.slice(1).join(' ') || '';
                  }

                  const residentData = {
                    property_id: property.id,
                    name: `${firstName} ${lastName}`.trim() || homeownerName?.toString() || 'Unknown Resident',
                    email: email,
                    phone: phone,
                    move_in_date: record.move_in_date || null,
                    is_primary: true,
                    emergency_contact: record.emergency_contact || null,
                    resident_type: determineResidentType(record)
                  };

                  const resident = await transactionManager.trackedInsert(context, 'residents', residentData);
                  devLog.info(`Created resident: ${resident.id} - ${residentData.name} for property ${propertyAddress}`);
                  
                  details.push({
                    status: 'success',
                    message: `Created resident: ${residentData.name} for property ${propertyAddress}`
                  });
                  
                } catch (residentError) {
                  devLog.error(`Failed to create resident for property ${propertyAddress}:`, residentError);
                  details.push({
                    status: 'warning',
                    message: `Property created but resident creation failed for ${propertyAddress}: ${residentError.message}`
                  });
                }
              } else {
                devLog.warn(`No homeowner data found for property ${propertyAddress}`);
                details.push({
                  status: 'warning',
                  message: `Property created but no homeowner data found for ${propertyAddress}`
                });
              }

              successfulImports++;
              
              details.push({
                status: 'success',
                message: `Created property: ${propertyAddress} (Account: ${accountNumber}) with city: ${city || 'N/A'}, state: ${state || 'N/A'}, zip: ${zip || 'N/A'}`
              });
              
            } catch (recordError) {
              devLog.error('Record processing error:', recordError);
              const error = EnhancedErrorHandler.handleError(recordError, `Record processing`);
              errors.push(error);
              failedImports++;
              
              // Enhanced error message for duplicate key violations
              let errorMessage = error.message;
              if (error.message.includes('properties_account_number_key')) {
                errorMessage = `Property with account number already exists. Please use unique account numbers or remove duplicates.`;
              }
              
              details.push({
                status: 'error',
                message: `Failed to import record: ${errorMessage}`
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
