
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile-types';

/**
 * Fetches a user's profile by user ID
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
      return null;
    }
    
    return data as Profile;
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error);
    return null;
  }
};
