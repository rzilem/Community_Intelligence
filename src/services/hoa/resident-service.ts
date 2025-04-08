
import { supabase } from '@/integrations/supabase/client';
import { Resident } from '@/types/app-types';

export const fetchResidentsByHOA = async (hoaId: string): Promise<Resident[]> => {
  // Fetch residents that are associated with properties in the given HOA
  const { data, error } = await supabase
    .from('residents' as any)
    .select(`
      *,
      property:property_id(
        id,
        association_id
      )
    `)
    .eq('property.association_id', hoaId);

  if (error) {
    throw new Error(`Error fetching residents: ${error.message}`);
  }

  // Cast data to any to avoid type errors
  return (data as any[]).map(resident => ({
    id: resident.id,
    user_id: resident.user_id,
    property_id: resident.property_id,
    resident_type: resident.resident_type,
    is_primary: resident.is_primary,
    move_in_date: resident.move_in_date,
    move_out_date: resident.move_out_date,
    name: resident.name || '',  // Add default values for required fields
    email: resident.email || '', // Add default values for required fields
    created_at: resident.created_at,
    updated_at: resident.updated_at
  }));
};

export const fetchResidentsByProperty = async (propertyId: string): Promise<Resident[]> => {
  const { data, error } = await supabase
    .from('residents' as any)
    .select('*')
    .eq('property_id', propertyId);

  if (error) {
    throw new Error(`Error fetching residents: ${error.message}`);
  }

  // Cast data to any to avoid type errors
  return (data as any[]).map(resident => ({
    id: resident.id,
    user_id: resident.user_id,
    property_id: resident.property_id,
    resident_type: resident.resident_type,
    is_primary: resident.is_primary,
    move_in_date: resident.move_in_date,
    move_out_date: resident.move_out_date,
    name: resident.name || '',  // Add default values for required fields
    email: resident.email || '', // Add default values for required fields
    created_at: resident.created_at,
    updated_at: resident.updated_at
  }));
};
