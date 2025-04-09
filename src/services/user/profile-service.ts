
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/app-types';

/**
 * Fetches the profile for the specified user ID
 */
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }

    return data as Profile;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};

/**
 * Updates user profile information
 */
export const updateUserProfile = async (profileData: Partial<Profile>): Promise<Profile | null> => {
  try {
    if (!profileData.id) {
      throw new Error('Profile ID is required for update');
    }

    console.log('Updating profile with data:', profileData);
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', profileData.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

    console.log('Profile updated successfully:', data);
    return data as Profile;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
};
