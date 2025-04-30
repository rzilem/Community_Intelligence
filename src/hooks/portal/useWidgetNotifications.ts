
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useSupabaseQuery } from '@/hooks/supabase';
import { useAuth } from '@/contexts/auth';

export const useWidgetNotifications = (widgetId: string) => {
  const { user } = useAuth();
  
  const { data: notifications } = useSupabaseQuery(
    'widget_notifications',
    {
      select: '*',
      filter: [
        { column: 'widget_id', value: widgetId },
        { column: 'user_id', value: user?.id }
      ],
      order: { column: 'created_at', ascending: false }
    },
    !!widgetId && !!user?.id
  );

  useEffect(() => {
    if (notifications?.length > 0) {
      const latestNotification = notifications[0];
      toast(latestNotification.title, {
        description: latestNotification.message,
      });
    }
  }, [notifications]);

  return { notifications };
};
