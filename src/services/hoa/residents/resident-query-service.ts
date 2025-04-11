
import { supabase } from '@/integrations/supabase/client';
import { Resident, ResidentWithProfile } from '@/types/app-types';
import { toast } from 'sonner';
import { mapDbToResident, toResidentType } from './resident-mapper';

/**
 * Fetches all residents for a specific property
 */
export const fetchResidentsByProperty = async (propertyId: string): Promise<Resident[]> => {
  const { data, error } = await supabase
    .from('residents')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at');

  if (error) {
    toast.error(`Error fetching residents: ${error.message}`);
    throw new Error(`Error fetching residents: ${error.message}`);
  }

  return (data || []).map(mapDbToResident);
};

/**
 * Fetches a single resident by ID
 */
export const fetchResidentById = async (id: string): Promise<Resident> => {
  const { data, error } = await supabase
    .from('residents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    toast.error(`Error fetching resident: ${error.message}`);
    throw new Error(`Error fetching resident: ${error.message}`);
  }

  return mapDbToResident(data);
};

/**
 * Fetches residents with their profile information
 */
export const fetchResidentsWithProfiles = async (propertyId: string): Promise<ResidentWithProfile[]> => {
  // Fetch residents first
  const { data, error } = await supabase
    .from('residents')
    .select('*')
    .eq('property_id', propertyId);

  if (error) {
    toast.error(`Error fetching residents: ${error.message}`);
    throw new Error(`Error fetching residents: ${error.message}`);
  }

  // If we have user_ids, we could fetch profiles in a separate query
  const userIds = (data || [])
    .filter(resident => resident.user_id)
    .map(resident => resident.user_id);
  
  let profilesMap = {};
  
  if (userIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
      
    if (!profilesError && profilesData) {
      profilesMap = profilesData.reduce((map, profile) => {
        map[profile.id] = profile;
        return map;
      }, {});
    }
  }

  return (data || []).map(resident => ({
    id: resident.id,
    user_id: resident.user_id,
    property_id: resident.property_id,
    resident_type: toResidentType(resident.resident_type),
    is_primary: resident.is_primary,
    move_in_date: resident.move_in_date,
    move_out_date: resident.move_out_date,
    name: resident.name,
    email: resident.email,
    phone: resident.phone,
    emergency_contact: resident.emergency_contact,
    created_at: resident.created_at,
    updated_at: resident.updated_at,
    user: resident.user_id && profilesMap[resident.user_id] ? {
      profile: {
        id: profilesMap[resident.user_id].id,
        first_name: profilesMap[resident.user_id].first_name,
        last_name: profilesMap[resident.user_id].last_name,
        email: profilesMap[resident.user_id].email,
        role: profilesMap[resident.user_id].role,
        phone_number: profilesMap[resident.user_id].phone_number,
        profile_image_url: profilesMap[resident.user_id].profile_image_url,
      }
    } : undefined
  }));
};
