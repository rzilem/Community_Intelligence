
import { supabase } from '@/integrations/supabase/client';
import { jobService } from '../job-service';

export const financialProcessor = {
  process: async (jobId: string, associationId: string, processedData: Record<string, any>[]) => {
    await jobService.updateImportJobStatus(jobId, 'validating');
    
    const tableName = 'assessments';
    const batchSize = 25;
    let successfulImports = 0;
    let failedImports = 0;
    const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];
    
    // Prepare data for import
    const preparedData = processedData.map(row => {
      // Create a new object with only the fields that exist in the schema
      return {
        property_id: row.property_id,
        amount: row.amount,
        due_date: row.due_date,
        paid: row.paid || false,
        payment_date: row.payment_date,
        late_fee: row.late_fee,
        assessment_type_id: row.assessment_type_id
        // Explicitly not including association_id as it doesn't exist in the schema
      };
    });
    
    for (let i = 0; i < preparedData.length; i += batchSize) {
      const batch = preparedData.slice(i, i + batchSize);
      
      try {
        console.log(`Importing financial data batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)`);
        
        if (!Array.isArray(batch) || batch.length === 0) {
          console.error('Empty or invalid batch data');
          failedImports += batch.length || 0;
          details.push({
            status: 'error',
            message: `Failed to import batch: Invalid data format`
          });
          continue;
        }
        
        const { data: insertedData, error } = await supabase
          .from(tableName as any)
          .insert(batch as any)
          .select('id');
        
        if (error) {
          console.error(`Error importing financial data:`, error);
          failedImports += batch.length;
          details.push({
            status: 'error',
            message: `Failed to import ${batch.length} records: ${error.message || 'Database error'}`
          });
        } else if (insertedData) {
          successfulImports += insertedData.length;
          details.push({
            status: 'success',
            message: `Imported ${insertedData.length} financial records successfully`
          });
        }
      } catch (e) {
        console.error(`Error in financial batch import:`, e);
        failedImports += batch.length;
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        details.push({
          status: 'error',
          message: `Failed to import ${batch.length} records: ${errorMessage}`
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
