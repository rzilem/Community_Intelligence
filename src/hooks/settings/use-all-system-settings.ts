
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isUserAdmin } from './settings-auth-utils';
import { SettingKey, defaultSettings } from './settings-hooks-types';
import { SystemSettings } from '@/types/settings-types';

// Fetch all system settings
export const useAllSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAllSettings = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is admin
        const isAdmin = await isUserAdmin();
        
        if (!isAdmin) {
          // Return default settings for non-admin users
          setSettings(defaultSettings);
          return;
        }
        
        const { data, error } = await supabase
          .from('system_settings')
          .select('key, value');
        
        if (error) {
          throw error;
        }
        
        const newSettings = { ...defaultSettings };
        
        if (data && data.length > 0) {
          data.forEach((item) => {
            const key = item.key as SettingKey;
            // Fix: Use type assertion to handle the conversion properly
            newSettings[key] = item.value as any;
          });
        }
        
        setSettings(newSettings);
      } catch (err) {
        console.error('Error fetching all settings:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllSettings();
  }, []);

  return { settings, isLoading, error };
};
