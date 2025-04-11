
import { supabase } from '@/integrations/supabase/client';
import { ImportResult } from '@/types/import-types';
import { jobService } from './job-service';

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
    
    // Process data by adding association_id to non-association tables
    const finalProcessedData = processedData.map(row => {
      // Don't add association_id when importing associations
      if (dataType === 'associations') {
        return { ...row };
      }
      // Add association_id to all other tables if not already present
      if (!row.association_id) {
        return { ...row, association_id: associationId };
      }
      return { ...row };
    });
    
    for (let i = 0; i < finalProcessedData.length; i += batchSize) {
      const batch = finalProcessedData.slice(i, i + batchSize);
      
      try {
        console.log(`Importing batch to ${tableName}:`, batch);
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
