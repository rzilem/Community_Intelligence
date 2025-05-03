
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserSettings, UserRole } from '@/types/profile-types';

/**
 * Update a user's profile in Supabase
 */
export const updateProfile = async (userId: string, data: Partial<Profile>): Promise<{ success: boolean; error?: string }> => {
  try {
    // If role is provided, ensure it's a valid UserRole
    if (data.role) {
      const validRoles: UserRole[] = ['admin', 'manager', 'resident', 'maintenance', 'accountant', 'user'];
      if (!validRoles.includes(data.role as UserRole)) {
        return { success: false, error: 'Invalid role provided' };
      }
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Alias for updateProfile for backward compatibility
 */
export const updateUserProfile = updateProfile;

/**
 * Update a user's password in Supabase
 */
export const updateUserPassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating password:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch user settings from Supabase
 */
export const fetchUserSettings = async (userId: string): Promise<{ data?: UserSettings; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { data: data as UserSettings };
  } catch (error: any) {
    console.error('Error fetching user settings:', error);
    return { error: error.message };
  }
};

/**
 * Update user preferences in Supabase
 */
export const updateUserPreferences = async (
  userId: string, 
  preferences: Partial<UserSettings>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('user_settings')
      .update(preferences)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating user preferences:', error);
    return { success: false, error: error.message };
  }
};
