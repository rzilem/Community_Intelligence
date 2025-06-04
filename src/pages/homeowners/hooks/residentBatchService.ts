// Legacy file - functionality moved to services/resident-fetch-service.ts
// Re-export for backward compatibility
export { residentFetchService as fetchResidentsBatched } from './services/resident-fetch-service';

// Keep the original function signature for compatibility
import { supabase } from '@/integrations/supabase/client';
import { DatabaseResident } from './types/resident-types';

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
