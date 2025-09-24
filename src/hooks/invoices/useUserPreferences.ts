
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

      // Mock user preferences since user_settings table doesn't exist
      const mockColumnPrefs = {
        invoicePreview: {
          ...defaultPreferences
        }
      };
      
      setPreferences({
        ...defaultPreferences,
        ...mockColumnPrefs.invoicePreview
      });
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

      // Mock saving preferences since user_settings table doesn't exist
      console.log('Mock: Saving user preferences:', updatedPreferences);
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
