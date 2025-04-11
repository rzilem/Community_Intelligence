
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  AppearanceSettings, 
  NotificationSettings, 
  SecuritySettings, 
  SystemPreferences,
  SystemSettings
} from '@/types/settings-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type SettingKey = 'appearance' | 'notifications' | 'security' | 'preferences' | 'integrations';

// Default settings to use if we can't fetch from the database
const defaultSettings: SystemSettings = {
  appearance: {
    theme: 'system',
    colorScheme: 'default',
    density: 'default',
    animationsEnabled: true,
    fontScale: 1
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    maintenanceAlerts: true,
    securityAlerts: true,
    newsAndUpdates: false
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordResetInterval: 90,
    ipWhitelist: ['192.168.1.1', '10.0.0.1']
  },
  preferences: {
    defaultAssociationId: 'assoc-1',
    defaultDateFormat: 'MM/DD/YYYY',
    defaultTimeFormat: '12h',
    defaultCurrency: 'USD',
    defaultLanguage: 'en',
    autoSave: true,
    sessionTimeout: 30
  },
  integrations: {
    integrationSettings: {}
  }
};

// Fetch a specific setting by key
export const useSystemSetting = <T>(key: SettingKey) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['systemSettings', key],
    queryFn: async (): Promise<T> => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', key)
        .single();
      
      if (error) {
        console.error(`Error fetching ${key} settings:`, error);
        // Return default settings if we can't fetch from the database
        return (defaultSettings[key] as unknown) as T;
      }
      
      return data.value as T;
    }
  });

  return {
    data: data || (defaultSettings[key] as unknown) as T,
    isLoading,
    error
  };
};

// Update a specific setting
export const useUpdateSystemSetting = <T>(key: SettingKey) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newValue: T): Promise<void> => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ 
          key, 
          value: newValue 
        }, {
          onConflict: 'key'
        });
      
      if (error) {
        console.error(`Error updating ${key} settings:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} settings updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['systemSettings', key] });
    },
    onError: (error) => {
      toast.error(`Failed to update ${key} settings: ${error.message}`);
    }
  });
};

// Fetch all system settings
export const useAllSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAllSettings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('system_settings')
          .select('key, value');
        
        if (error) {
          throw error;
        }
        
        const newSettings = { ...defaultSettings };
        
        data.forEach((item) => {
          const key = item.key as SettingKey;
          newSettings[key] = item.value;
        });
        
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
