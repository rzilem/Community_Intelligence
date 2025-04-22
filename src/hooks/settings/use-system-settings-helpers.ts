
import { SystemSettings } from '@/types/settings-types';
import { supabase } from '@/integrations/supabase/client';

export const saveSystemSettings = async (settings: SystemSettings) => {
  try {
    // Save appearance settings
    if (settings.appearance) {
      await updateSettingWithFunction('appearance', settings.appearance);
    }
    
    // Save notifications settings
    if (settings.notifications) {
      await updateSettingWithFunction('notifications', settings.notifications);
    }
    
    // Save security settings
    if (settings.security) {
      await updateSettingWithFunction('security', settings.security);
    }
    
    // Save preferences settings
    if (settings.preferences) {
      await updateSettingWithFunction('preferences', settings.preferences);
    }
    
    // Save integrations settings
    if (settings.integrations) {
      await updateSettingWithFunction('integrations', settings.integrations);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving system settings:', error);
    throw error;
  }
};

const updateSettingWithFunction = async (key: string, value: any) => {
  // Create a replacer function to mask sensitive information in logs
  const replacer = (k: string, v: any) => {
    // Mask API keys in logs
    if ((k === 'apiKey' || k === 'secret' || k === 'webhookSecret') && typeof v === 'string') {
      return v ? '[PRESENT]' : '[MISSING]';
    }
    return v;
  };

  // Log the masked version of the value
  console.log(`Updating ${key} settings:`, JSON.stringify(value, replacer, 2));
  
  try {
    // Ensure the value is properly serializable by explicitly converting to a clean object
    const safeValue = JSON.parse(JSON.stringify(value));
    
    // Make the request to the Supabase Edge Function
    const { error } = await supabase.functions.invoke(`settings/${key}`, {
      method: 'POST',
      body: safeValue,
    });
    
    if (error) {
      console.error(`Error updating ${key} settings:`, error);
      throw new Error(`Failed to update ${key} settings: ${error.message}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error in updateSettingWithFunction for ${key}:`, error);
    throw new Error(`Failed to process ${key} settings: ${error.message || 'Unknown error'}`);
  }
};
