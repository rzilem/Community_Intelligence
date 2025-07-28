import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { isAdminRole } from '@/utils/role-utils';
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
    fontScale: 1,
    showAuthDebugger: false
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
    autoSave: true
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

    return isAdminRole(data?.role);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Safe JSON response handler
const handleJsonResponse = async (response: Response) => {
  const text = await response.text();
  if (!text || text.trim() === '') {
    console.warn('Empty response received');
    return { success: false, error: 'Empty response from server' };
  }
  
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('JSON parse error:', { text, error });
    return { success: false, error: 'Invalid JSON response from server' };
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
        
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        
        if (!token) {
          console.warn('No auth token available');
          return (defaultSettings[key] as unknown) as T;
        }

        // Use the settings edge function through Supabase client instead of direct fetch
        const { data: functionData, error: functionError } = await supabase.functions.invoke(`settings/${key}`, {
          method: 'GET'
        });

        if (functionError) {
          console.error(`Error calling settings function for ${key}:`, functionError);
          return (defaultSettings[key] as unknown) as T;
        }

        if (!functionData?.success) {
          console.error(`Error fetching ${key} settings:`, functionData?.error);
          return (defaultSettings[key] as unknown) as T;
        }
        
        return functionData.data as T;
      } catch (err) {
        console.error(`Error in useSystemSetting for ${key}:`, err);
        return (defaultSettings[key] as unknown) as T;
      }
    },
    staleTime: 60000, // 1 minute
    retry: (failureCount, error) => {
      // Retry up to 2 times for network errors, but not for auth errors
      return failureCount < 2 && !error?.toString().includes('auth');
    },
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
      
      console.log(`Updating system setting ${key} with value:`, JSON.stringify(newValue, null, 2));
      
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Use the settings edge function through Supabase client instead of direct fetch
      const { data: functionData, error: functionError } = await supabase.functions.invoke(`settings/${key}`, {
        method: 'POST',
        body: newValue,
      });
      
      if (functionError) {
        console.error("Error calling settings function:", functionError);
        throw new Error(functionError.message || 'Failed to update settings');
      }
      
      if (!functionData?.success) {
        console.error("Error updating settings:", functionData);
        throw new Error(functionData?.error || 'Failed to update settings');
      }
      
      console.log(`Successfully updated system setting: ${key}`);
    },
    onSuccess: () => {
      toast.success(`${key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')} settings updated successfully`);
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
        // Keep default settings on error
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllSettings();
  }, []);

  return { settings, isLoading, error };
};
