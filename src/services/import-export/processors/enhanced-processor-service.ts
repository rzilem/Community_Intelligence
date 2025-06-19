
import { enhancedPropertiesOwnersProcessor } from './enhanced-properties-owners-processor';
import { enhancedOwnersProcessor } from './enhanced-owners-processor';
import { financialProcessor } from './financial-processor';
import { genericProcessor } from './generic-processor';
import { EnhancedErrorHandler } from '../enhanced-error-handler';
import { devLog } from '@/utils/dev-logger';

export const enhancedProcessorService = {
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
    try {
      devLog.info(`[EnhancedProcessorService] Processing ${dataType} data for association ${associationId}`);
      
      // Validate input data
      if (!processedData || processedData.length === 0) {
        throw new Error('No data provided for processing');
      }

      if (!associationId) {
        throw new Error('Association ID is required');
      }

      // Route to appropriate enhanced processor based on data type
      switch (dataType) {
        case 'properties_owners':
          devLog.info('[EnhancedProcessorService] Using enhanced properties & owners processor');
          return await enhancedPropertiesOwnersProcessor.process(jobId, associationId, processedData);
        
        case 'owners':
          devLog.info('[EnhancedProcessorService] Using enhanced owners processor');
          return await enhancedOwnersProcessor.process(jobId, associationId, processedData);
        
        case 'financial':
        case 'assessments':
          devLog.info('[EnhancedProcessorService] Using financial processor');
          return await financialProcessor.process(jobId, associationId, processedData);
        
        default:
          devLog.info(`[EnhancedProcessorService] Using generic processor for ${dataType}`);
          return await genericProcessor.process(jobId, associationId, dataType, processedData);
      }
    } catch (error) {
      const categorizedError = EnhancedErrorHandler.handleError(error, 'Processor Service');
      devLog.error('[EnhancedProcessorService] Processing failed:', categorizedError);
      
      return {
        success: false,
        successfulImports: 0,
        failedImports: processedData?.length || 0,
        details: [{
          status: 'error' as const,
          message: `Processing failed: ${categorizedError.message}`
        }]
      };
    }
  }
};
