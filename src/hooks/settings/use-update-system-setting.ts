
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isUserAdmin } from './settings-auth-utils';
import { SettingKey } from './settings-hooks-types';

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
