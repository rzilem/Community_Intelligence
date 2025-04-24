
import { supabase } from '@/integrations/supabase/client';

export const saveColumnPreferences = async (
  userId: string,
  tableKey: string,
  columns: Record<string, boolean>
): Promise<{ success: boolean; error?: string }> => {
  try {
    // First, try to get existing user settings
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('column_preferences')
      .eq('user_id', userId)
      .single();
      
    const updatedPreferences = {
      ...(existingSettings?.column_preferences || {}),
      [tableKey]: columns,
    };
    
    // Now upsert the settings
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        column_preferences: updatedPreferences,
      });
      
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error saving column preferences:', error);
    return { success: false, error: error.message };
  }
};

export const getColumnPreferences = async (
  userId: string,
  tableKey: string
): Promise<Record<string, boolean> | null> => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('column_preferences')
      .eq('user_id', userId)
      .single();
      
    if (error) throw error;
    
    return data?.column_preferences?.[tableKey] || null;
  } catch (error: any) {
    console.error('Error getting column preferences:', error);
    return null;
  }
};
