
import { supabase } from '@/integrations/supabase/client';
import { HOA, Property, Resident } from '@/types/app-types';

export const fetchHOAs = async (): Promise<HOA[]> => {
  const { data, error } = await supabase
    .from('associations' as any)
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Error fetching HOAs: ${error.message}`);
  }

  return data.map(association => ({
    id: association.id,
    name: association.name,
    address: association.address,
    contact_email: association.contact_email,
    created_at: association.created_at,
    updated_at: association.updated_at
  }));
};

export const fetchHOAById = async (id: string): Promise<HOA> => {
  const { data, error } = await supabase
    .from('associations' as any)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error fetching HOA: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    address: data.address,
    contact_email: data.contact_email,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const createHOA = async (hoa: Partial<HOA>): Promise<HOA> => {
  const { data, error } = await supabase
    .from('associations' as any)
    .insert({
      name: hoa.name,
      address: hoa.address,
      contact_email: hoa.contact_email
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating HOA: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    address: data.address,
    contact_email: data.contact_email,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const updateHOA = async (id: string, hoa: Partial<HOA>): Promise<HOA> => {
  const { data, error } = await supabase
    .from('associations' as any)
    .update({
      name: hoa.name,
      address: hoa.address,
      contact_email: hoa.contact_email
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating HOA: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    address: data.address,
    contact_email: data.contact_email,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const deleteHOA = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('associations' as any)
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting HOA: ${error.message}`);
  }
};

export const fetchPropertiesByHOA = async (hoaId: string): Promise<Property[]> => {
  const { data, error } = await supabase
    .from('properties' as any)
    .select('*')
    .eq('association_id', hoaId)
    .order('address');

  if (error) {
    throw new Error(`Error fetching properties: ${error.message}`);
  }

  return data.map(property => ({
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

  // Map to our application's Resident type
  return data.map(resident => ({
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

  return data.map(resident => ({
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
