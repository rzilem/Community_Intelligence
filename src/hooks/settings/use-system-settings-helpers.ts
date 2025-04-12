
import { supabase } from '@/integrations/supabase/client';
import { SystemSettings } from '@/types/settings-types';

// Helper function to check if user is admin
export const isUserAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    return data?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Function to save system settings
export const saveSystemSettings = async (
  settings: SystemSettings
): Promise<void> => {
  // Get the user session and user ID properly
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  
  if (!userId) {
    throw new Error("You must be logged in to update system settings");
  }
  
  // Get the user's profile to check if they're an admin
  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profileData?.role !== 'admin') {
    throw new Error("Only administrators can update system settings");
  }
  
  // Save all settings that have changed
  const savePromises = Object.keys(settings).map(async (key) => {
    const settingKey = key as keyof SystemSettings;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cahergndkwfqltxyikyr.supabase.co';
    
    // Call the settings edge function with the full URL
    const response = await fetch(`${supabaseUrl}/functions/v1/settings/${settingKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify(settings[settingKey]),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Response parsing error' }));
      throw new Error(errorData.error || `Failed to save ${settingKey} settings`);
    }
  });
  
  await Promise.all(savePromises);
};
