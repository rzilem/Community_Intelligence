
import { supabase } from '@/integrations/supabase/client';
import { SystemSettings } from '@/types/settings-types';
import { toast } from 'sonner';

// Function to save system settings to Supabase
export const saveSystemSettings = async (settings: SystemSettings): Promise<void> => {
  try {
    // Check if user is admin first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    
    const { data: userRole } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (userRole?.role !== 'admin') {
      throw new Error("Only administrators can update system settings");
    }
    
    // Update each settings category separately to ensure proper database structure
    for (const category of ['appearance', 'notifications', 'security', 'preferences', 'integrations'] as const) {
      // Serialize the settings to proper JSON format to satisfy the database type requirements
      const serializedValue = JSON.stringify(settings[category]);
      
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: category,
          value: JSON.parse(serializedValue) // Parse back to object to ensure proper JSON structure
        }, {
          onConflict: 'key'
        });
        
      if (error) throw error;
    }
    
    console.log("Successfully saved all system settings");
  } catch (error) {
    console.error("Error saving system settings:", error);
    throw error;
  }
};

// Function to apply appearance settings to the DOM
export const applyAppearanceSettings = (appearance: SystemSettings['appearance']) => {
  // Apply theme (light, dark, system)
  if (appearance.theme === 'light') {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else if (appearance.theme === 'dark') {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    // System theme
    localStorage.removeItem('theme');
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  
  // Apply color scheme
  document.documentElement.style.setProperty('--color-scheme', appearance.colorScheme);
  
  // Apply font scale
  document.documentElement.style.setProperty('--font-scale', appearance.fontScale.toString());
  
  // Apply density
  document.documentElement.setAttribute('data-density', appearance.density);
  
  // Apply animations setting
  if (!appearance.animationsEnabled) {
    document.documentElement.classList.add('no-animations');
  } else {
    document.documentElement.classList.remove('no-animations');
  }
};
