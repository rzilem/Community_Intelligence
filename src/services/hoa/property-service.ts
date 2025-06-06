
import { supabase } from '@/integrations/supabase/client';
import { Property, PropertyRecord } from '@/types/app-types';
import { mapPropertyRecord } from '@/utils/property-utils';

export const fetchPropertiesByHOA = async (hoaId: string): Promise<Property[]> => {
  const { data, error } = await (supabase as any)
    .from('properties')
    .select('*')
    .eq('association_id', hoaId)
    .order('address');

  if (error) {
    throw new Error(`Error fetching properties: ${error.message}`);
  }

  return (data as PropertyRecord[]).map(mapPropertyRecord);
};
