
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/app-types';

export const fetchPropertiesByHOA = async (hoaId: string): Promise<Property[]> => {
  const { data, error } = await supabase
    .from('properties' as any)
    .select('*')
    .eq('association_id', hoaId)
    .order('address');

  if (error) {
    throw new Error(`Error fetching properties: ${error.message}`);
  }

  // Cast data to any to avoid type errors
  return (data as any[]).map(property => ({
    id: property.id,
    association_id: property.association_id,
    property_type: property.property_type || '',
    address: property.address,
    unit_number: property.unit_number,
    square_feet: property.square_feet,
    city: property.city,
    state: property.state,
    zip: property.zip,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    created_at: property.created_at,
    updated_at: property.updated_at
  }));
};
