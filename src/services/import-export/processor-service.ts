
import { supabase } from '@/integrations/supabase/client';
import { ImportResult } from '@/types/import-types';
import { jobService } from './job-service';
import { propertiesOwnersProcessor } from './processors/properties-owners-processor';
import { financialProcessor } from './processors/financial-processor';
import { ownersProcessor } from './processors/owners-processor';
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
    // Route to appropriate processor based on data type
    switch (dataType) {
      case 'properties_owners':
        return await propertiesOwnersProcessor.process(jobId, associationId, processedData);
      
      case 'owners':
        return await ownersProcessor.process(jobId, associationId, processedData);
      
      case 'financial':
      case 'assessments':
        return await financialProcessor.process(jobId, associationId, processedData);
      
      default:
        return await genericProcessor.process(jobId, associationId, dataType, processedData);
    }
  }
};
