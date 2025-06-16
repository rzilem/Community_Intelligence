
import { supabase } from '@/integrations/supabase/client';

// Add a simple cache to prevent repeated identical requests
const preferencesCache = new Map<string, { data: string[]; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Save column preferences for a specific view for a user
 */
export const saveUserColumnPreferences = async (
  userId: string,
  viewId: string,
  columnIds: string[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Update cache immediately for optimistic updates
    const cacheKey = `${userId}-${viewId}`;
    preferencesCache.set(cacheKey, { data: columnIds, timestamp: Date.now() });

    // First try to get existing user settings
    const { data: settings, error: fetchError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
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
      
      if (error) throw error;
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
      
      if (error) throw error;
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error saving column preferences:', error);
    // Remove from cache on error
    const cacheKey = `${userId}-${viewId}`;
    preferencesCache.delete(cacheKey);
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
    // Check cache first
    const cacheKey = `${userId}-${viewId}`;
    const cached = preferencesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return { data: cached.data };
    }

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
    
    const result = columnPreferences[viewId];
    
    // Update cache with fresh data
    if (result) {
      preferencesCache.set(cacheKey, { data: result, timestamp: Date.now() });
    }
    
    return { 
      data: result
    };
  } catch (error: any) {
    console.error('Error fetching user column preferences:', error);
    return { error: error.message };
  }
};
