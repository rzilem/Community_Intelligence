
import { TransactionManager, TransactionContext } from '../transaction-manager';
import { EnhancedErrorHandler, ImportError } from '../enhanced-error-handler';
import { jobService } from '../job-service';
import { devLog } from '@/utils/dev-logger';

export const enhancedOwnersProcessor = {
  process: async (jobId: string, associationId: string, processedData: Record<string, any>[]) => {
    const transactionManager = await TransactionManager.create();
    const errors: ImportError[] = [];
    let successfulImports = 0;
    let failedImports = 0;
    const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];

    try {
      await jobService.updateImportJobStatus(jobId, 'processing');

      const result = await transactionManager.executeWithRollback(async (context: TransactionContext) => {
        const batchSize = 15; // Smaller batches for better error handling
        
        for (let i = 0; i < processedData.length; i += batchSize) {
          const batch = processedData.slice(i, i + batchSize);
          
          devLog.info(`Processing owners batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)`);
          
          for (const record of batch) {
            try {
              // Validate required fields
              if (!record.property_id) {
                throw new Error('Property ID is required for resident records');
              }

              if (!record.first_name && !record.last_name) {
                throw new Error('At least first name or last name is required');
              }

              const residentData = {
                association_id: associationId,
                property_id: record.property_id,
                first_name: record.first_name || '',
                last_name: record.last_name || '',
                email: record.email || record.contact_email || null,
                phone: record.phone || record.phone_number || null,
                move_in_date: record.move_in_date || null,
                is_primary: record.is_primary !== undefined ? record.is_primary : true,
                emergency_contact: record.emergency_contact || null,
                resident_type: record.resident_type || 'owner'
              };

              const resident = await transactionManager.trackedInsert(context, 'residents', residentData);
              devLog.info(`Created resident: ${resident.id} - ${residentData.first_name} ${residentData.last_name}`);
              
              successfulImports++;
              
            } catch (recordError) {
              const error = EnhancedErrorHandler.handleError(recordError, 'Resident processing');
              errors.push(error);
              failedImports++;
              
              details.push({
                status: 'error',
                message: `Failed to import resident (${record.first_name || ''} ${record.last_name || ''}): ${error.message}`
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
      const categorizedError = EnhancedErrorHandler.handleError(error, 'Owners Import');
      
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
