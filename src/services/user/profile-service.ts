
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/app-types';
import { UserSettings } from '@/types/profile-types';

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

/**
 * Updates a user's password
 */
export const updateUserPassword = async (
  userId: string, 
  currentPassword: string, 
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Updates a user's profile
 * Alias for updateProfile for compatibility
 */
export const updateUserProfile = async (profileData: Partial<Profile>): Promise<boolean> => {
  if (!profileData.id) return false;
  return updateProfile(profileData.id, profileData);
};

/**
 * Fetches a user's settings
 */
export const fetchUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
    
    return data as UserSettings;
  } catch (error) {
    console.error('Unexpected error fetching user settings:', error);
    return null;
  }
};

/**
 * Updates a user's preferences
 */
export const updateUserPreferences = async (
  userId: string, 
  preferences: { 
    theme?: string; 
    notifications_enabled?: boolean 
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        theme: preferences.theme,
        notifications_enabled: preferences.notifications_enabled
      }, { onConflict: 'user_id' });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
