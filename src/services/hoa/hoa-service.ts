
import { supabase } from '@/integrations/supabase/client';
import { Association } from '@/types/association-types';
import { devLog } from '@/utils/dev-logger';

// Create a type alias for HOA using Association to maintain backwards compatibility
type HOA = Association;

export const fetchHOAs = async (): Promise<HOA[]> => {
  const { data, error } = await supabase
    .from('associations' as any)
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Error fetching HOAs: ${error.message}`);
  }

  // Cast data to any to avoid type errors and then map to our app type
  return (data as any[]).map(association => ({
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

  // Cast data to any to avoid the type error
  const association = data as any;
  
  return {
    id: association.id,
    name: association.name,
    address: association.address,
    contact_email: association.contact_email,
    created_at: association.created_at,
    updated_at: association.updated_at
  };
};

export const createHOA = async (hoa: Partial<HOA>): Promise<HOA> => {
  const { data, error } = await supabase
    .from('associations' as any)
    .insert({
      name: hoa.name,
      address: hoa.address,
      contact_email: hoa.contact_email
    } as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating HOA: ${error.message}`);
  }

  // Cast data to any to avoid the type error
  const association = data as any;
  
  return {
    id: association.id,
    name: association.name,
    address: association.address,
    contact_email: association.contact_email,
    created_at: association.created_at,
    updated_at: association.updated_at
  };
};

export const updateHOA = async (id: string, hoa: Partial<HOA>): Promise<HOA> => {
  const { data, error } = await supabase
    .from('associations' as any)
    .update({
      name: hoa.name,
      address: hoa.address,
      contact_email: hoa.contact_email
    } as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating HOA: ${error.message}`);
  }

  // Cast data to any to avoid the type error
  const association = data as any;
  
  return {
    id: association.id,
    name: association.name,
    address: association.address,
    contact_email: association.contact_email,
    created_at: association.created_at,
    updated_at: association.updated_at
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
