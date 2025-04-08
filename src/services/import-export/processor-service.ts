
import { supabase } from '@/integrations/supabase/client';
import { ImportResult } from '@/types/import-types';
import { jobService } from './job-service';
import { mappingService } from './mapping-service';

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
    let tableName: string;
    switch (dataType) {
      case 'associations':
        tableName = 'associations';
        break;
      case 'owners':
        tableName = 'residents';
        processedData.forEach(row => {
          row.resident_type = 'owner';
        });
        break;
      case 'properties':
        tableName = 'properties';
        break;
      case 'financial':
        tableName = 'assessments';
        break;
      case 'compliance':
        tableName = 'compliance_issues';
        break;
      case 'maintenance':
        tableName = 'maintenance_requests';
        break;
      case 'vendors':
        tableName = 'vendors';
        processedData.forEach(row => {
          row.status = row.status || 'active';
          row.hasInsurance = row.hasInsurance === 'true' || row.hasInsurance === true || false;
        });
        break;
      default:
        tableName = dataType;
    }
    
    await jobService.updateImportJobStatus(jobId, 'validating');
    
    const batchSize = 50;
    let successfulImports = 0;
    let failedImports = 0;
    const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];
    
    for (let i = 0; i < processedData.length; i += batchSize) {
      const batch = processedData.slice(i, i + batchSize);
      
      try {
        const { data: insertedData, error } = await supabase
          .from(tableName as any)
          .insert(batch as any)
          .select('id');
        
        if (error) {
          console.error(`Error importing batch to ${tableName}:`, error);
          failedImports += batch.length;
          details.push({
            status: 'error',
            message: `Failed to import ${batch.length} records: ${error.message}`
          });
        } else if (insertedData) {
          successfulImports += insertedData.length;
          details.push({
            status: 'success',
            message: `Imported ${insertedData.length} records successfully`
          });
        }
      } catch (e) {
        console.error(`Error in batch import:`, e);
        failedImports += batch.length;
        details.push({
          status: 'error',
          message: `Failed to import ${batch.length} records: ${e instanceof Error ? e.message : 'Unknown error'}`
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
