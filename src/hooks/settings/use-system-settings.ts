
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  AppearanceSettings, 
  NotificationSettings, 
  SecuritySettings, 
  SystemPreferences,
  IntegrationSettings,
  WebhookSettings,
  SystemSettings,
  SettingKey
} from '@/types/settings-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
  },
  webhook_settings: {
    cloudmailin_webhook_url: '',
    cloudmailin_secret: '',
    webhook_secret: ''
  }
};

// Helper function to check if user is admin
const isUserAdmin = async (): Promise<boolean> => {
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

// Fetch a specific setting by key
export const useSystemSetting = <T>(key: SettingKey) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['systemSettings', key],
    queryFn: async (): Promise<T> => {
      try {
        const isAdmin = await isUserAdmin();
        if (!isAdmin) {
          return (defaultSettings[key] as unknown) as T;
        }
        
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
      } catch (err) {
        console.error(`Error in useSystemSetting for ${key}:`, err);
        return (defaultSettings[key] as unknown) as T;
      }
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
      const isAdmin = await isUserAdmin();
      if (!isAdmin) {
        throw new Error('Only administrators can update system settings');
      }
      
      console.log(`Updating system setting ${key} with value:`, newValue);
      
      // Use the edge function to update settings
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/settings/${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify(newValue),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating settings:", errorData);
        throw new Error(errorData.error || 'Failed to update settings');
      }
      
      console.log(`Successfully updated system setting: ${key}`);
    },
    onSuccess: () => {
      toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} settings updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['systemSettings', key] });
    },
    onError: (error) => {
      console.error(`Error updating ${key} settings:`, error);
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
