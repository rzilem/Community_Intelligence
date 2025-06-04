
import { supabase } from '@/integrations/supabase/client';
import { DatabaseResident } from './types';

/**
 * Fetches resident data in batches to avoid "URL too long" errors
 */
export const fetchResidentsBatched = async (
  propertyIds: string[], 
  batchSize = 500
): Promise<DatabaseResident[]> => {
  const allResidents: DatabaseResident[] = [];
  
  for (let i = 0; i < propertyIds.length; i += batchSize) {
    const batchIds = propertyIds.slice(i, i + batchSize);
    console.log(`Fetching batch ${Math.floor(i/batchSize) + 1} with ${batchIds.length} properties`);
    
    const { data: residentsData, error: residentsError } = await supabase
      .from('residents')
      .select('*')
      .in('property_id', batchIds);
    
    if (residentsError) {
      console.error('Error fetching residents batch:', residentsError);
      throw new Error('Failed to load residents: ' + residentsError.message);
    }
    
    if (residentsData) {
      allResidents.push(...residentsData);
    }
  }
  
  return allResidents;
};
