
import { supabase } from '@/integrations/supabase/client';
import { Amenity } from '@/types/app-types';
import { toast } from 'sonner';

export const fetchAmenitiesByHOA = async (hoaId: string): Promise<Amenity[]> => {
  const { data, error } = await supabase
    .from('amenities' as any)
    .select('*')
    .eq('association_id', hoaId)
    .order('name');

  if (error) {
    toast.error(`Error fetching amenities: ${error.message}`);
    throw new Error(`Error fetching amenities: ${error.message}`);
  }

  return (data as any[]).map(amenity => ({
    id: amenity.id,
    association_id: amenity.association_id,
    name: amenity.name,
    description: amenity.description,
    capacity: amenity.capacity,
    booking_fee: amenity.booking_fee,
    requires_approval: amenity.requires_approval,
    created_at: amenity.created_at,
    updated_at: amenity.updated_at
  }));
};

export const fetchAmenityById = async (id: string): Promise<Amenity> => {
  const { data, error } = await supabase
    .from('amenities' as any)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    toast.error(`Error fetching amenity: ${error.message}`);
    throw new Error(`Error fetching amenity: ${error.message}`);
  }

  const amenity = data as any;
  
  return {
    id: amenity.id,
    association_id: amenity.association_id,
    name: amenity.name,
    description: amenity.description,
    capacity: amenity.capacity,
    booking_fee: amenity.booking_fee,
    requires_approval: amenity.requires_approval,
    created_at: amenity.created_at,
    updated_at: amenity.updated_at
  };
};

export const createAmenity = async (amenity: Partial<Amenity>): Promise<Amenity> => {
  const { data, error } = await supabase
    .from('amenities' as any)
    .insert(amenity as any)
    .select()
    .single();

  if (error) {
    toast.error(`Error creating amenity: ${error.message}`);
    throw new Error(`Error creating amenity: ${error.message}`);
  }

  toast.success('Amenity created successfully');
  const newAmenity = data as any;
  
  return {
    id: newAmenity.id,
    association_id: newAmenity.association_id,
    name: newAmenity.name,
    description: newAmenity.description,
    capacity: newAmenity.capacity,
    booking_fee: newAmenity.booking_fee,
    requires_approval: newAmenity.requires_approval,
    created_at: newAmenity.created_at,
    updated_at: newAmenity.updated_at
  };
};

export const updateAmenity = async (id: string, amenity: Partial<Amenity>): Promise<Amenity> => {
  const { data, error } = await supabase
    .from('amenities' as any)
    .update(amenity as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    toast.error(`Error updating amenity: ${error.message}`);
    throw new Error(`Error updating amenity: ${error.message}`);
  }

  toast.success('Amenity updated successfully');
  const updatedAmenity = data as any;
  
  return {
    id: updatedAmenity.id,
    association_id: updatedAmenity.association_id,
    name: updatedAmenity.name,
    description: updatedAmenity.description,
    capacity: updatedAmenity.capacity,
    booking_fee: updatedAmenity.booking_fee,
    requires_approval: updatedAmenity.requires_approval,
    created_at: updatedAmenity.created_at,
    updated_at: updatedAmenity.updated_at
  };
};

export const deleteAmenity = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('amenities' as any)
    .delete()
    .eq('id', id);

  if (error) {
    toast.error(`Error deleting amenity: ${error.message}`);
    throw new Error(`Error deleting amenity: ${error.message}`);
  }

  toast.success('Amenity deleted successfully');
};
