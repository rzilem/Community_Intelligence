
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

  // Get the address field from various possible column names
  const addressField = record['Property Address'] || record['Mailing Address'] || 
                       record.address || record.property_address || record.street_address || 
                       record.Address || record['Address'] || '';
  
  devLog.info('Raw address field:', addressField);
  
  if (!addressField) {
    devLog.warn('No address field found in record');
    return { propertyAddress: '', mailingAddress: '', city: '', state: '', zip: '' };
  }

  const addressStr = String(addressField).trim();
  
  // Handle cases with P: and M: prefixes
  if (addressStr.includes('P:') || addressStr.includes('M:')) {
    // Extract property address (P:)
    const pMatch = addressStr.match(/P:\s*([^M]*)/i);
    if (pMatch) {
      propertyAddress = pMatch[1].trim();
    }
    
    // Extract mailing address (M:)
    const mMatch = addressStr.match(/M:\s*(.*)/i);
    if (mMatch) {
      mailingAddress = mMatch[1].trim();
    }
    
    // If no property address found but mailing exists, use mailing as property
    if (!propertyAddress && mailingAddress) {
      propertyAddress = mailingAddress;
    }
  } else {
    // No prefixes, use the entire address as property address
    propertyAddress = addressStr;
  }

  devLog.info('Extracted property address before parsing:', propertyAddress);

  // Parse city, state, zip from property address
  if (propertyAddress) {
    // Remove any lingering P: or M: prefixes
    propertyAddress = propertyAddress.replace(/^[PM]:\s*/gi, '').trim();
    
    // Enhanced parsing for different address formats
    // Pattern 1: "123 Main St, City Name, ST 12345"
    let match = propertyAddress.match(/^(.+?),\s*([^,]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/i);
    if (match) {
      propertyAddress = match[1].trim();
      city = match[2].trim();
      state = match[3].toUpperCase();
      zip = match[4];
      devLog.info('Matched comma-separated pattern');
    } else {
      // Pattern 2: "123 Main St City Name ST 12345" (space-separated)
      match = propertyAddress.match(/^(.+?)\s+([A-Za-z\s]+?)\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/i);
      if (match) {
        const streetPart = match[1].trim();
        const cityPart = match[2].trim();
        state = match[3].toUpperCase();
        zip = match[4];
        
        // More intelligent street/city separation
        const allWords = (streetPart + ' ' + cityPart).split(/\s+/);
        
        // Common street suffixes that help us identify where street ends
        const streetSuffixes = ['ST', 'STREET', 'AVE', 'AVENUE', 'RD', 'ROAD', 'BLVD', 'BOULEVARD', 'LN', 'LANE', 'DR', 'DRIVE', 'CT', 'COURT', 'CIR', 'CIRCLE', 'WAY', 'PL', 'PLACE'];
        
        let streetEndIndex = -1;
        for (let i = 0; i < allWords.length; i++) {
          if (streetSuffixes.includes(allWords[i].toUpperCase())) {
            streetEndIndex = i;
            break;
          }
        }
        
        if (streetEndIndex > -1) {
          // Street ends at suffix
          propertyAddress = allWords.slice(0, streetEndIndex + 1).join(' ');
          city = allWords.slice(streetEndIndex + 1).join(' ');
        } else {
          // Fallback: assume last 1-2 words are city
          if (allWords.length >= 3) {
            city = allWords.slice(-2).join(' ');
            propertyAddress = allWords.slice(0, -2).join(' ');
          } else {
            city = cityPart;
            propertyAddress = streetPart;
          }
        }
        devLog.info('Matched space-separated pattern');
      } else {
        // Pattern 3: Try to find just state and zip at the end
        match = propertyAddress.match(/^(.+?)\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/i);
        if (match) {
          const addressPart = match[1].trim();
          state = match[2].toUpperCase();
          zip = match[3];
          
          // Split address part into street and city
          const words = addressPart.split(/\s+/);
          if (words.length >= 2) {
            city = words[words.length - 1];
            propertyAddress = words.slice(0, -1).join(' ');
          } else {
            propertyAddress = addressPart;
          }
          devLog.info('Matched state-zip pattern');
        }
      }
    }
  }

  const result = { propertyAddress, mailingAddress, city, state, zip };
  devLog.info('Final parsed address components:', result);
  return result;
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
              let accountNumber = record['Account #'] || 
                                record['Homeowner ID'] || 
                                record.account_number || 
                                record.account || 
                                record.homeowner_id || 
                                null;
              
              // Ensure account number is a string and not empty
              if (accountNumber) {
                accountNumber = String(accountNumber).trim();
              }
              
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
                zip_code: zip || record.zip || record.zip_code || null,
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
              const homeownerName = record['Homeowner'] || record.homeowner || record.Homeowner || record.owner_name || record.first_name || record.last_name;
              const email = record['Email'] || record.email || record.Email || record.contact_email || null;
              const phone = record['Phone'] || record.phone || record.Phone || record.phone_number || null;
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
