
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ResidentPortalSettings {
  id?: string;
  resident_id: string;
  notification_preferences?: Record<string, boolean>;
  theme_preference?: 'light' | 'dark' | 'system';
  dashboard_layout?: Array<{ id: string; type: string; position: number }>;
}

export function useResidentPortalSettings(residentId: string) {
  const [settings, setSettings] = useState<ResidentPortalSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPortalSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('resident_portal_settings')
        .select('*')
        .eq('resident_id', residentId)
        .single();

      if (error) {
        console.error('Error fetching portal settings:', error);
        // If no settings exist, create default settings
        const { data: newSettings, error: insertError } = await supabase
          .from('resident_portal_settings')
          .insert({ resident_id: residentId })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        // Transform the data to match the expected type
        const formattedSettings: ResidentPortalSettings = {
          ...newSettings,
          notification_preferences: newSettings.notification_preferences 
            ? (typeof newSettings.notification_preferences === 'object' 
                ? newSettings.notification_preferences as Record<string, boolean> 
                : JSON.parse(newSettings.notification_preferences as string))
            : {},
          dashboard_layout: newSettings.dashboard_layout 
            ? (typeof newSettings.dashboard_layout === 'object'
                ? newSettings.dashboard_layout as Array<{ id: string; type: string; position: number }>
                : JSON.parse(newSettings.dashboard_layout as string))
            : []
        };
        
        setSettings(formattedSettings);
      } else {
        // Transform the data to match the expected type
        const formattedSettings: ResidentPortalSettings = {
          ...data,
          notification_preferences: data.notification_preferences 
            ? (typeof data.notification_preferences === 'object' 
                ? data.notification_preferences as Record<string, boolean> 
                : JSON.parse(data.notification_preferences as string))
            : {},
          dashboard_layout: data.dashboard_layout 
            ? (typeof data.dashboard_layout === 'object'
                ? data.dashboard_layout as Array<{ id: string; type: string; position: number }>
                : JSON.parse(data.dashboard_layout as string))
            : []
        };
        
        setSettings(formattedSettings);
      }
    } catch (err) {
      console.error('Error in fetchPortalSettings:', err);
      toast.error('Failed to load portal settings');
    } finally {
      setLoading(false);
    }
  };

  const updatePortalSettings = async (updates: Partial<ResidentPortalSettings>) => {
    if (!settings) return;

    try {
      const { data, error } = await supabase
        .from('resident_portal_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;

      setSettings(prev => ({ ...prev!, ...updates }));
      toast.success('Portal settings updated');
    } catch (err) {
      console.error('Error updating portal settings:', err);
      toast.error('Failed to update portal settings');
    }
  };

  useEffect(() => {
    if (residentId) {
      fetchPortalSettings();
    }
  }, [residentId]);

  return {
    settings,
    loading,
    updatePortalSettings,
    fetchPortalSettings
  };
}
