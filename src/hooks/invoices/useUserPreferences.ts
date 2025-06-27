
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserPreferences {
  preferredViewMode: 'pdf' | 'html' | 'auto';
  enableAutoFallback: boolean;
  enablePdfThumbnails: boolean;
  showValidationTools: boolean;
}

const defaultPreferences: UserPreferences = {
  preferredViewMode: 'auto',
  enableAutoFallback: true,
  enablePdfThumbnails: false,
  showValidationTools: true
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('column_preferences')
        .eq('user_id', user.id)
        .single();

      if (!error && data?.column_preferences?.invoicePreview) {
        setPreferences({
          ...defaultPreferences,
          ...data.column_preferences.invoicePreview
        });
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          column_preferences: {
            invoicePreview: updatedPreferences
          }
        });

      if (error) {
        console.error('Failed to save preferences:', error);
      }
    } catch (error) {
      console.error('Failed to update user preferences:', error);
    }
  };

  return {
    preferences,
    updatePreferences,
    isLoading
  };
};
