
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { isUserAdmin } from './settings-auth-utils';
import { SettingKey, defaultSettings, SystemSettingResult } from './settings-hooks-types';

// Fetch a specific setting by key
export const useSystemSetting = <T>(key: SettingKey): SystemSettingResult<T> => {
  const result = useQuery({
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

  // Create a new object that extends all properties from useQuery result
  // while ensuring data is always defined
  return {
    ...result,
    data: result.data ?? (defaultSettings[key] as unknown) as T,
  } as SystemSettingResult<T>;
};
