
import { useAuth } from '@/contexts/auth';
import { useSupabaseQuery } from '@/hooks/supabase';
import { useSupabaseUpdate } from '@/hooks/supabase/use-supabase-update';
import { useSupabaseCreate } from '@/hooks/supabase/use-supabase-create';
import { WidgetType } from '@/types/portal-types';
import { toast } from 'sonner';

interface WidgetSettings {
  id: string;
  widgetType: WidgetType;
  settings: Record<string, any>;
  position: number;
  isEnabled: boolean;
}

export const useWidgetSettings = (portalType: 'user' | 'association') => {
  const { user, currentAssociation } = useAuth();
  
  // Fetch user-specific or association-wide widget settings
  const { data: widgetSettings = [], isLoading } = useSupabaseQuery(
    portalType === 'user' ? 'user_portal_widgets' : 'association_portal_widgets',
    {
      select: '*',
      filter: portalType === 'user' 
        ? [{ column: 'user_id', value: user?.id }]
        : [{ column: 'association_id', value: currentAssociation?.id }],
      order: { column: 'position', ascending: true },
    },
    !!user?.id || !!currentAssociation?.id
  );

  // Mutation hooks for saving widget settings
  const updateWidget = useSupabaseUpdate(
    portalType === 'user' ? 'user_portal_widgets' : 'association_portal_widgets'
  );
  
  const createWidget = useSupabaseCreate(
    portalType === 'user' ? 'user_portal_widgets' : 'association_portal_widgets'
  );

  // Save or update widget settings
  const saveWidgetSettings = async (widgetType: WidgetType, settings: Record<string, any>) => {
    const existingWidget = widgetSettings.find(w => w.widgetType === widgetType);
    
    try {
      if (existingWidget) {
        await updateWidget.mutateAsync({
          id: existingWidget.id,
          data: {
            settings,
            updated_at: new Date().toISOString()
          }
        });
      } else {
        await createWidget.mutateAsync({
          widgetType,
          settings,
          position: widgetSettings.length,
          is_enabled: true,
          ...(portalType === 'user' 
            ? { user_id: user?.id }
            : { association_id: currentAssociation?.id }
          )
        });
      }
      
      toast.success('Widget settings saved successfully');
    } catch (error) {
      console.error('Error saving widget settings:', error);
      toast.error('Failed to save widget settings');
    }
  };

  // Toggle widget visibility
  const toggleWidget = async (widgetId: string, isEnabled: boolean) => {
    try {
      await updateWidget.mutateAsync({
        id: widgetId,
        data: { is_enabled: isEnabled }
      });
      
      toast.success(isEnabled ? 'Widget enabled' : 'Widget disabled');
    } catch (error) {
      console.error('Error toggling widget:', error);
      toast.error('Failed to update widget status');
    }
  };

  return {
    widgetSettings,
    isLoading,
    saveWidgetSettings,
    toggleWidget
  };
};
