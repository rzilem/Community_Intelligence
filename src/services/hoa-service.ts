
import { supabase } from '@/integrations/supabase/client';
import { HOA, Property, Resident } from '@/types/app-types';

export const fetchHOAs = async (): Promise<HOA[]> => {
  const { data, error } = await supabase
    .from('hoas')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Error fetching HOAs: ${error.message}`);
  }

  return data;
};

export const fetchHOAById = async (id: string): Promise<HOA> => {
  const { data, error } = await supabase
    .from('hoas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error fetching HOA: ${error.message}`);
  }

  return data;
};

export const createHOA = async (hoa: Partial<HOA>): Promise<HOA> => {
  const { data, error } = await supabase
    .from('hoas')
    .insert(hoa)
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating HOA: ${error.message}`);
  }

  return data;
};

export const updateHOA = async (id: string, hoa: Partial<HOA>): Promise<HOA> => {
  const { data, error } = await supabase
    .from('hoas')
    .update(hoa)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating HOA: ${error.message}`);
  }

  return data;
};

export const deleteHOA = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('hoas')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting HOA: ${error.message}`);
  }
};

export const fetchPropertiesByHOA = async (hoaId: string): Promise<Property[]> => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('hoa_id', hoaId)
    .order('address');

  if (error) {
    throw new Error(`Error fetching properties: ${error.message}`);
  }

  return data;
};

export const fetchResidentsByHOA = async (hoaId: string): Promise<Resident[]> => {
  const { data, error } = await supabase
    .from('residents')
    .select(`
      *,
      resident_properties!inner(
        property:property_id(
          id,
          hoa_id
        )
      )
    `)
    .eq('resident_properties.property.hoa_id', hoaId);

  if (error) {
    throw new Error(`Error fetching residents: ${error.message}`);
  }

  return data;
};

export const fetchResidentsByProperty = async (propertyId: string): Promise<Resident[]> => {
  const { data, error } = await supabase
    .from('residents')
    .select(`
      *,
      resident_properties!inner(*)
    `)
    .eq('resident_properties.property_id', propertyId);

  if (error) {
    throw new Error(`Error fetching residents: ${error.message}`);
  }

  return data;
};
