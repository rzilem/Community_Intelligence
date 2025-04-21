
import { supabase } from '@/integrations/supabase/client';
import { OwnerData } from './types';
import { jobService } from '../job-service';

export const ownerProcessor = {
  processBatch: async (
    batch: OwnerData[],
    batchIndex: number
  ): Promise<{
    successCount: number;
    details: Array<{ status: 'success' | 'error' | 'warning'; message: string }>;
  }> => {
    const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];

    try {
      const { data: result, error } = await supabase
        .from('residents')
        .insert(batch)
        .select('id');
        
      if (error) {
        console.error('Error importing owner batch:', error);
        details.push({
          status: 'error',
          message: `Failed to import owner batch: ${error.message || 'Database error'}`
        });
        return { successCount: 0, details };
      }
      
      if (result && result.length > 0) {
        details.push({
          status: 'success',
          message: `Imported ${result.length} owners successfully (batch ${batchIndex + 1})`
        });
        return { successCount: result.length, details };
      }
      
      return { successCount: 0, details };
    } catch (err) {
      console.error('Error in owner batch processing:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      details.push({
        status: 'error',
        message: `Failed to import owner batch: ${errorMessage}`
      });
      return { successCount: 0, details };
    }
  }
};
