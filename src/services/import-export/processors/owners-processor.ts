
import { supabase } from '@/integrations/supabase/client';
import { jobService } from '../job-service';

export const ownersProcessor = {
  process: async (jobId: string, associationId: string, processedData: Record<string, any>[]) => {
    await jobService.updateImportJobStatus(jobId, 'processing');
    
    const batchSize = 25;
    let successfulImports = 0;
    let failedImports = 0;
    const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];
    
    for (let i = 0; i < processedData.length; i += batchSize) {
      const batch = processedData.slice(i, i + batchSize);
      
      try {
        console.log(`Processing owners batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)`);
        
        const insertData = batch.map(record => ({
          association_id: associationId,
          property_id: record.property_id,
          first_name: record.first_name || '',
          last_name: record.last_name || '',
          email: record.email || record.contact_email,
          phone: record.phone || record.phone_number,
          move_in_date: record.move_in_date || null,
          is_primary: record.is_primary !== undefined ? record.is_primary : true,
          emergency_contact: record.emergency_contact || null,
          resident_type: record.resident_type || 'owner'
        }));
        
        const { data: insertedData, error } = await supabase
          .from('residents')
          .insert(insertData)
          .select('id');
        
        if (error) {
          console.error('Error importing owners:', error);
          failedImports += batch.length;
          details.push({
            status: 'error',
            message: `Failed to import ${batch.length} owner records: ${error.message}`
          });
        } else if (insertedData) {
          successfulImports += insertedData.length;
          details.push({
            status: 'success',
            message: `Imported ${insertedData.length} owner records successfully`
          });
        }
      } catch (batchError) {
        console.error('Error in owners batch processing:', batchError);
        failedImports += batch.length;
        const errorMessage = batchError instanceof Error ? batchError.message : 'Unknown error';
        details.push({
          status: 'error',
          message: `Failed to process owners batch: ${errorMessage}`
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
