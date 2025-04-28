
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useSupabaseQuery } from '@/hooks/supabase';
import { useAuth } from '@/contexts/auth';

export const useWidgetNotifications = (widgetId: string) => {
  const { user } = useAuth();
  const shownNotificationsRef = useRef(new Set<string>());
  
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
      
      // Only show if not already shown in this session
      if (!shownNotificationsRef.current.has(latestNotification.id)) {
        toast(latestNotification.title, {
          id: `widget-notification-${latestNotification.id}`,
          description: latestNotification.message,
        });
        
        // Mark as shown
        shownNotificationsRef.current.add(latestNotification.id);
      }
    }
  }, [notifications]);

  return { notifications };
};
