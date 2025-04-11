import { supabase } from '@/integrations/supabase/client';
import { Resident, ResidentWithProfile } from '@/types/app-types';
import { toast } from 'sonner';

export const fetchResidentsByProperty = async (propertyId: string): Promise<Resident[]> => {
  const { data, error } = await supabase
    .from('residents' as any)
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at');

  if (error) {
    toast.error(`Error fetching residents: ${error.message}`);
    throw new Error(`Error fetching residents: ${error.message}`);
  }

  return (data as any[]).map(resident => ({
    id: resident.id,
    user_id: resident.user_id,
    property_id: resident.property_id,
    resident_type: resident.resident_type,
    is_primary: resident.is_primary,
    move_in_date: resident.move_in_date,
    move_out_date: resident.move_out_date,
    name: resident.name,
    email: resident.email,
    phone: resident.phone,
    emergency_contact: resident.emergency_contact,
    created_at: resident.created_at,
    updated_at: resident.updated_at
  }));
};

export const fetchResidentById = async (id: string): Promise<Resident> => {
  const { data, error } = await supabase
    .from('residents' as any)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    toast.error(`Error fetching resident: ${error.message}`);
    throw new Error(`Error fetching resident: ${error.message}`);
  }

  const resident = data as any;
  
  return {
    id: resident.id,
    user_id: resident.user_id,
    property_id: resident.property_id,
    resident_type: resident.resident_type,
    is_primary: resident.is_primary,
    move_in_date: resident.move_in_date,
    move_out_date: resident.move_out_date,
    name: resident.name,
    email: resident.email,
    phone: resident.phone,
    emergency_contact: resident.emergency_contact,
    created_at: resident.created_at,
    updated_at: resident.updated_at
  };
};

export const fetchResidentsWithProfiles = async (propertyId: string): Promise<ResidentWithProfile[]> => {
  const { data, error } = await supabase
    .from('residents' as any)
    .select(`
      *,
      profiles:user_id (*)
    `)
    .eq('property_id', propertyId);

  if (error) {
    toast.error(`Error fetching residents with profiles: ${error.message}`);
    throw new Error(`Error fetching residents with profiles: ${error.message}`);
  }

  return (data as any[]).map(resident => ({
    id: resident.id,
    user_id: resident.user_id,
    property_id: resident.property_id,
    resident_type: resident.resident_type,
    is_primary: resident.is_primary,
    move_in_date: resident.move_in_date,
    move_out_date: resident.move_out_date,
    name: resident.name,
    email: resident.email,
    phone: resident.phone,
    emergency_contact: resident.emergency_contact,
    created_at: resident.created_at,
    updated_at: resident.updated_at,
    user: resident.profiles ? {
      profile: {
        id: resident.profiles.id,
        first_name: resident.profiles.first_name,
        last_name: resident.profiles.last_name,
        email: resident.profiles.email,
        role: resident.profiles.role,
        phone_number: resident.profiles.phone_number,
        profile_image_url: resident.profiles.profile_image_url,
      }
    } : undefined
  }));
};

export const createResident = async (resident: Partial<Resident>): Promise<Resident> => {
  console.log("Creating resident with data:", resident);
  
  // Make sure we have valid property ID
  if (!resident.property_id) {
    toast.error(`Error creating resident: Property ID is required`);
    throw new Error(`Error creating resident: Property ID is required`);
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
  const newResident = data as any;
  console.log("Resident created:", newResident);
  
  return {
    id: newResident.id,
    user_id: newResident.user_id,
    property_id: newResident.property_id,
    resident_type: newResident.resident_type,
    is_primary: newResident.is_primary,
    move_in_date: newResident.move_in_date,
    move_out_date: newResident.move_out_date,
    name: newResident.name,
    email: newResident.email,
    phone: newResident.phone,
    emergency_contact: newResident.emergency_contact,
    created_at: newResident.created_at,
    updated_at: newResident.updated_at
  };
};

export const updateResident = async (id: string, resident: Partial<Resident>): Promise<Resident> => {
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
  const updatedResident = data as any;
  
  return {
    id: updatedResident.id,
    user_id: updatedResident.user_id,
    property_id: updatedResident.property_id,
    resident_type: updatedResident.resident_type,
    is_primary: updatedResident.is_primary,
    move_in_date: updatedResident.move_in_date,
    move_out_date: updatedResident.move_out_date,
    name: updatedResident.name,
    email: updatedResident.email,
    phone: updatedResident.phone,
    emergency_contact: updatedResident.emergency_contact,
    created_at: updatedResident.created_at,
    updated_at: updatedResident.updated_at
  };
};

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

export const enableRealtimeForResidents = () => {
  try {
    // Use Supabase's built-in channel functionality instead of RPC calls
    // This subscribes to changes on the residents table
    const channel = supabase
      .channel('residents-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'residents'
      }, (payload) => {
        console.log('Realtime update for residents:', payload);
      })
      .subscribe();
    
    console.log('Realtime updates for residents enabled successfully');
    
    // Return the channel so it could be unsubscribed if needed
    return channel;
  } catch (error) {
    console.error('Error setting up realtime for residents:', error);
  }
};

// Initialize realtime updates when this module is loaded
const residentsChannel = enableRealtimeForResidents();
