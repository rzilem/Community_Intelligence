
import { supabase } from '@/integrations/supabase/client';
import { jobService } from '../job-service';

export const genericProcessor = {
  process: async (jobId: string, associationId: string, dataType: string, processedData: Record<string, any>[]) => {
    await jobService.updateImportJobStatus(jobId, 'processing');
    
    // Map data types to table names
    const tableMap: Record<string, string> = {
      'owners': 'residents',
      'maintenance': 'maintenance_requests',
      'compliance': 'compliance_issues',
      'vendors': 'vendors'
    };
    
    const tableName = tableMap[dataType] || dataType;
    const batchSize = 25;
    let successfulImports = 0;
    let failedImports = 0;
    const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];
    
    // Process data in batches
    for (let i = 0; i < processedData.length; i += batchSize) {
      const batch = processedData.slice(i, i + batchSize);
      
      try {
        console.log(`Importing ${dataType} batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)`);
        
        if (!Array.isArray(batch) || batch.length === 0) {
          console.error('Empty or invalid batch data');
          failedImports += batch.length || 0;
          details.push({
            status: 'error',
            message: `Failed to import batch: Invalid data format`
          });
          continue;
        }
        
        // Add association_id to each record if not present
        const batchWithAssociation = batch.map(record => ({
          ...record,
          association_id: record.association_id || associationId
        }));
        
        const { data: insertedData, error } = await supabase
          .from(tableName as any)
          .insert(batchWithAssociation as any)
          .select('id');
        
        if (error) {
          console.error(`Error importing ${dataType}:`, error);
          failedImports += batch.length;
          details.push({
            status: 'error',
            message: `Failed to import ${batch.length} ${dataType} records: ${error.message || 'Database error'}`
          });
        } else if (insertedData) {
          successfulImports += insertedData.length;
          details.push({
            status: 'success',
            message: `Imported ${insertedData.length} ${dataType} records successfully`
          });
        }
      } catch (e) {
        console.error(`Error in ${dataType} batch import:`, e);
        failedImports += batch.length;
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        details.push({
          status: 'error',
          message: `Failed to import ${batch.length} ${dataType} records: ${errorMessage}`
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
