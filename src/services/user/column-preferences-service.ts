
import { supabase } from '@/integrations/supabase/client';

/**
 * Save column preferences for a specific view for a user
 */
export const saveUserColumnPreferences = async (
  userId: string,
  viewId: string,
  columnIds: string[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    // First try to get existing user settings
    const { data: settings, error: fetchError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    let columnPreferences: Record<string, string[]> = {};
    
    if (settings) {
      // Merge with existing column preferences if they exist
      columnPreferences = settings.column_preferences || {};
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
      
      if (error) throw error;
    } else {
      // Create new settings
      const { error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          column_preferences: columnPreferences
        });
      
      if (error) throw error;
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
    const { data, error } = await supabase
      .from('user_settings')
      .select('column_preferences')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found - not an error, just return undefined
        return { data: undefined };
      }
      throw error;
    }
    
    return { 
      data: data?.column_preferences?.[viewId] || undefined
    };
  } catch (error: any) {
    console.error('Error fetching user column preferences:', error);
    return { error: error.message };
  }
};
