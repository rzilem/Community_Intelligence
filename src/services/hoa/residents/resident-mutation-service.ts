
import { supabase } from '@/integrations/supabase/client';
import { Resident } from '@/types/app-types';
import { toast } from 'sonner';
import { mapDbToResident, toResidentType } from './resident-mapper';

/**
 * Creates a new resident
 */
export const createResident = async (resident: Partial<Resident>): Promise<Resident> => {
  console.log("Creating resident with data:", resident);
  
  // Make sure we have valid property ID
  if (!resident.property_id) {
    toast.error(`Error creating resident: Property ID is required`);
    throw new Error(`Error creating resident: Property ID is required`);
  }

  // Make sure resident_type is a valid ResidentType
  if (resident.resident_type) {
    resident.resident_type = toResidentType(resident.resident_type as string);
  }

  const { data, error } = await supabase
    .from('residents' as any)
    .insert(resident as any)
    .select()
    .single();

  if (error) {
    console.error("Supabase error:", error);
    toast.error(`Error creating resident: ${error.message}`);
    throw new Error(`Error creating resident: ${error.message}`);
  }

  toast.success('Resident created successfully');
  console.log("Resident created:", data);
  
  return mapDbToResident(data);
};

/**
 * Updates an existing resident
 */
export const updateResident = async (id: string, resident: Partial<Resident>): Promise<Resident> => {
  // Make sure resident_type is a valid ResidentType if provided
  if (resident.resident_type) {
    resident.resident_type = toResidentType(resident.resident_type as string);
  }

  const { data, error } = await supabase
    .from('residents' as any)
    .update(resident as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    toast.error(`Error updating resident: ${error.message}`);
    throw new Error(`Error updating resident: ${error.message}`);
  }

  toast.success('Resident updated successfully');
  return mapDbToResident(data);
};

/**
 * Deletes a resident
 */
export const deleteResident = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('residents' as any)
    .delete()
    .eq('id', id);

  if (error) {
    toast.error(`Error deleting resident: ${error.message}`);
    throw new Error(`Error deleting resident: ${error.message}`);
  }

  toast.success('Resident deleted successfully');
};
