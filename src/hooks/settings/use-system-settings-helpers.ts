
import { AppearanceSettings } from "@/types/settings-types";
import { supabase } from "@/integrations/supabase/client";

// Apply appearance settings to the document
export const applyAppearanceSettings = (settings: AppearanceSettings): void => {
  // Apply theme
  if (settings.theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (settings.theme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // System preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Apply color scheme
  document.documentElement.setAttribute('data-color-scheme', settings.colorScheme);
  
  // Apply density
  document.documentElement.setAttribute('data-density', settings.density);
  
  // Apply font scale
  document.documentElement.style.setProperty('--font-scale', settings.fontScale.toString());
  
  // Apply animations setting
  if (!settings.animationsEnabled) {
    document.documentElement.classList.add('no-animations');
  } else {
    document.documentElement.classList.remove('no-animations');
  }
};

// Save all system settings
export const saveSystemSettings = async (settings: any) => {
  try {
    const { error: appearanceError } = await supabase
      .from('system_settings')
      .upsert({ key: 'appearance', value: settings.appearance });
    
    if (appearanceError) throw appearanceError;
    
    const { error: notificationsError } = await supabase
      .from('system_settings')
      .upsert({ key: 'notifications', value: settings.notifications });
    
    if (notificationsError) throw notificationsError;
    
    const { error: securityError } = await supabase
      .from('system_settings')
      .upsert({ key: 'security', value: settings.security });
    
    if (securityError) throw securityError;
    
    const { error: preferencesError } = await supabase
      .from('system_settings')
      .upsert({ key: 'preferences', value: settings.preferences });
    
    if (preferencesError) throw preferencesError;
    
    const { error: integrationsError } = await supabase
      .from('system_settings')
      .upsert({ key: 'integrations', value: settings.integrations });
    
    if (integrationsError) throw integrationsError;
    
    return true;
  } catch (error) {
    console.error('Error saving system settings:', error);
    throw error;
  }
};
