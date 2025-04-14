
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/app-types';

/**
 * Updates a user's profile information
 */
export const updateProfile = async (userId: string, profileData: Partial<Profile>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error updating profile:', error);
    return false;
  }
};

/**
 * Fetches a user's profile information
 * This function is exported from here to avoid duplicate export from fetchUserProfile.ts
 */
export const getProfileById = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data as Profile;
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return null;
  }
};
