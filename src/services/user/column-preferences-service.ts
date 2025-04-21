
import { supabase } from '@/integrations/supabase/client';
import { UserSettings } from '@/types/profile-types';
import { toast } from 'sonner';

/**
 * Save column preferences for a specific view for a user
 */
export const saveUserColumnPreferences = async (
  userId: string,
  viewId: string,
  columnIds: string[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!columnIds || !Array.isArray(columnIds) || columnIds.length === 0) {
      console.error('Invalid column IDs provided to saveUserColumnPreferences:', columnIds);
      return { success: false, error: 'Invalid column IDs' };
    }
    
    console.log(`Saving column preferences for user ${userId}, view ${viewId}`, columnIds);
    
    // First try to get existing user settings
    const { data: settings, error: fetchError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user settings:', fetchError);
      return { success: false, error: fetchError.message };
    }
    
    // Initialize column preferences with empty object if not exist
    let columnPreferences: Record<string, string[]> = {};
    
    if (settings && settings.column_preferences) {
      // Safely parse the column_preferences if it's a JSON value
      try {
        // Handle the case where the column preferences is already a proper object
        if (typeof settings.column_preferences === 'object' && settings.column_preferences !== null) {
          columnPreferences = settings.column_preferences as Record<string, string[]>;
        } else {
          // If it's a string, attempt to parse it
          columnPreferences = JSON.parse(settings.column_preferences as string);
        }
      } catch (e) {
        console.error('Error parsing column preferences:', e);
        // If parsing fails, just use an empty object
        columnPreferences = {};
      }
    }
    
    // Update the preferences for this specific view
    columnPreferences = {
      ...columnPreferences,
      [viewId]: columnIds
    };
    
    if (settings) {
      // Update existing settings
      const { error } = await supabase
        .from('user_settings')
        .update({ column_preferences: columnPreferences })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error updating user settings:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Updated user_settings successfully');
    } else {
      // Create new settings
      const { error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          column_preferences: columnPreferences,
          theme: 'system',
          notifications_enabled: true
        });
      
      if (error) {
        console.error('Error creating user settings:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Created new user_settings successfully');
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error saving column preferences:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get column preferences for a specific view for a user
 */
export const getUserColumnPreferences = async (
  userId: string,
  viewId: string
): Promise<{ data?: string[]; error?: string }> => {
  try {
    console.log(`Getting column preferences for user ${userId}, view ${viewId}`);
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('column_preferences')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found - not an error, just return undefined
        console.log('No user settings found');
        return { data: undefined };
      }
      console.error('Error fetching user settings:', error);
      return { error: error.message };
    }
    
    // Process column preferences safely
    let columnPreferences: Record<string, string[]> = {};
    if (data?.column_preferences) {
      try {
        // Handle the case where it's already an object
        if (typeof data.column_preferences === 'object' && data.column_preferences !== null) {
          columnPreferences = data.column_preferences as Record<string, string[]>;
        } else {
          // If it's a string, attempt to parse it
          columnPreferences = JSON.parse(data.column_preferences as string);
        }
      } catch (e) {
        console.error('Error parsing column preferences:', e);
        columnPreferences = {};
      }
    }
    
    console.log('Retrieved column preferences:', columnPreferences[viewId]);
    
    // Validate that we have an array
    if (columnPreferences[viewId] && Array.isArray(columnPreferences[viewId])) {
      return { data: columnPreferences[viewId] };
    } else {
      console.log('Retrieved invalid column preferences, returning undefined');
      return { data: undefined };
    }
  } catch (error: any) {
    console.error('Error fetching user column preferences:', error);
    return { error: error.message };
  }
};
