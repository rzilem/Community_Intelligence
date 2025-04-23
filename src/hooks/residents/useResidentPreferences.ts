
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResidentPreferences } from '@/types/resident-types';
import { toast } from 'sonner';

export const useResidentPreferences = (residentId: string) => {
  const [preferences, setPreferences] = useState<ResidentPreferences>({});

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('residents')
        .select('preferences')
        .eq('id', residentId)
        .single();

      if (error) throw error;
      setPreferences(data?.preferences as ResidentPreferences || {});
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load resident preferences');
    }
  };

  const updatePreferences = async (newPreferences: Partial<ResidentPreferences>) => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };

      const { error } = await supabase
        .from('residents')
        .update({ preferences: updatedPreferences })
        .eq('id', residentId);

      if (error) throw error;

      setPreferences(updatedPreferences);
      toast.success('Preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  return { 
    preferences, 
    fetchPreferences, 
    updatePreferences 
  };
};
