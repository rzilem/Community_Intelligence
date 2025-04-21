
import { supabase } from '@/integrations/supabase/client';
import { PropertyData, PropertyProcessorResult } from './types';
import { jobService } from '../job-service';

export const propertyProcessor = {
  processBatch: async (
    batch: PropertyData[],
    batchIndex: number,
    jobId: string
  ): Promise<PropertyProcessorResult> => {
    const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];
    
    try {
      const { data: properties, error } = await supabase
        .from('properties')
        .insert(batch)
        .select('id, address, unit_number');
      
      if (error) {
        console.error('Error importing property batch:', error);
        details.push({
          status: 'error',
          message: `Failed to import property batch: ${error.message || 'Database error'}`
        });
        return { properties: [], successCount: 0, details };
      }
      
      if (properties && properties.length > 0) {
        details.push({
          status: 'success',
          message: `Imported ${properties.length} properties successfully (batch ${batchIndex + 1})`
        });
        return { 
          properties, 
          successCount: properties.length, 
          details 
        };
      }
      
      return { properties: [], successCount: 0, details };
    } catch (err) {
      console.error('Error in property batch processing:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      details.push({
        status: 'error',
        message: `Failed to import property batch: ${errorMessage}`
      });
      return { properties: [], successCount: 0, details };
    }
  }
};
