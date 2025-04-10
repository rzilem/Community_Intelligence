
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserSettings } from '@/types/profile-types';

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

/**
 * Updates user security settings
 */
export const updateUserPassword = async (
  userId: string, 
  currentPassword: string, 
  newPassword: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Fetches user settings using a generic query approach
 */
export const fetchUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    // Use a raw query approach to bypass TypeScript checking for table names
    const { data, error } = await supabase
      .rpc('get_user_settings', { user_id_param: userId })
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching user settings:', error);
      throw error;
    }
    
    return data as UserSettings || null;
  } catch (error) {
    console.error('Error in fetchUserSettings:', error);
    return null;
  }
};

/**
 * Updates user preferences using a generic approach
 */
export const updateUserPreferences = async (
  userId: string,
  preferences: { theme?: string; notifications_enabled?: boolean }
): Promise<{ success: boolean; error: string | null }> => {
  try {
    // Check if user settings exist
    const { data: existingSettings } = await supabase
      .rpc('check_user_settings_exist', { user_id_param: userId });
    
    if (existingSettings) {
      // Update existing settings
      const { error } = await supabase
        .rpc('update_user_settings', { 
          user_id_param: userId,
          theme_param: preferences.theme,
          notifications_param: preferences.notifications_enabled
        });
        
      if (error) throw error;
    } else {
      // Create new settings
      const { error } = await supabase
        .rpc('create_user_settings', { 
          user_id_param: userId,
          theme_param: preferences.theme,
          notifications_param: preferences.notifications_enabled
        });
        
      if (error) throw error;
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating user preferences:', error);
    return { success: false, error: error.message };
  }
};
