
import { supabase } from '@/integrations/supabase/client';
import { ImportResult } from '@/types/import-types';
import { jobService } from './job-service';
import { propertiesOwnersProcessor } from './processors/properties-owners-processor';
import { financialProcessor } from './processors/financial-processor';
import { genericProcessor } from './processors/generic-processor';

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
    // Special handling for properties_owners combined import
    if (dataType === 'properties_owners') {
      return await propertiesOwnersProcessor.process(jobId, associationId, processedData);
    }
    
    // Special handling for financial data
    if (dataType === 'financial') {
      return await financialProcessor.process(jobId, associationId, processedData);
    }
    
    // Handle all other data types
    const result = await genericProcessor.process(jobId, associationId, dataType, processedData);
    
    // Update job status to completed or failed
    const finalStatus = result.failedImports === 0 ? 'completed' : 'failed';
    await jobService.updateImportJobStatus(jobId, finalStatus, {
      processed: processedData.length,
      succeeded: result.successfulImports,
      failed: result.failedImports,
      errorDetails: result.failedImports > 0 ? { details: result.details } : undefined
    });
    
    return result;
  }
};
