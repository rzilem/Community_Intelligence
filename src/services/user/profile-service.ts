
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
 * Fetches user settings with a direct table query instead of RPC
 */
export const fetchUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    console.log('Fetching settings for user ID:', userId);
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user settings:', error);
      throw error;
    }
    
    console.log('User settings data:', data);
    return data as UserSettings;
  } catch (error) {
    console.error('Error in fetchUserSettings:', error);
    return null;
  }
};

/**
 * Updates user preferences with direct table operations instead of RPC
 */
export const updateUserPreferences = async (
  userId: string,
  preferences: { theme?: string; notifications_enabled?: boolean }
): Promise<{ success: boolean; error: string | null }> => {
  try {
    console.log('Updating preferences for user ID:', userId, 'with data:', preferences);
    
    // Check if user settings exist
    const { data: existingSettings, error: checkError } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking user settings:', checkError);
      throw checkError;
    }
    
    let result;
    
    if (existingSettings) {
      // Update existing settings
      result = await supabase
        .from('user_settings')
        .update({
          theme: preferences.theme,
          notifications_enabled: preferences.notifications_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      // Create new settings
      result = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          theme: preferences.theme || 'system',
          notifications_enabled: preferences.notifications_enabled !== false
        });
    }
    
    if (result.error) {
      console.error('Error updating user preferences:', result.error);
      throw result.error;
    }
    
    console.log('User preferences updated successfully');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error in updateUserPreferences:', error);
    return { success: false, error: error.message };
  }
};
