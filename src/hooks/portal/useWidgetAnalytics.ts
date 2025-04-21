
import { useEffect } from 'react';
import { useSupabaseCreate } from '@/hooks/supabase/use-supabase-create';
import { useAuth } from '@/contexts/auth';

export const useWidgetAnalytics = (widgetId: string, widgetType: string) => {
  const { user } = useAuth();
  const createAnalytics = useSupabaseCreate('widget_analytics');

  useEffect(() => {
    const trackView = async () => {
      if (!user?.id || !widgetId) return;

      await createAnalytics.mutateAsync({
        widget_id: widgetId,
        widget_type: widgetType,
        user_id: user.id,
        action: 'view',
        timestamp: new Date().toISOString()
      });
    };

    trackView();
  }, [widgetId, widgetType, user?.id]);

  const trackAction = async (action: string) => {
    if (!user?.id || !widgetId) return;

    await createAnalytics.mutateAsync({
      widget_id: widgetId,
      widget_type: widgetType,
      user_id: user.id,
      action,
      timestamp: new Date().toISOString()
    });
  };

  return { trackAction };
};
