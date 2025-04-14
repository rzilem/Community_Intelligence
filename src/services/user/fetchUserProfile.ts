
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile-types';

/**
 * Fetches a user's complete profile data from Supabase
 */
export const fetchUserProfile = async (userId: string): Promise<{ profile?: Profile; error?: string }> => {
  try {
    if (!userId) {
      return { error: 'User ID is required' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Ensure the profile has all required fields
    const profile: Profile = {
      ...data,
      role: data.role || 'user',
      created_at: data.created_at,
      updated_at: data.updated_at,
      // Backward compatibility fields if needed
      profile_image_url: data.profile_image_url || null,
      phone: data.phone_number || null
    };

    return { profile };
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return { error: error.message };
  }
};
