
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NotificationContext, Notification } from '@/contexts/notifications/NotificationContext';
import { NotificationItem } from './useNotifications';
import { useAuth } from '@/contexts/auth';
import { useNotificationContext } from '@/contexts/notifications';

export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  const { notifications, setNotifications } = useNotificationContext();

  useEffect(() => {
    if (!user || !setNotifications) return;

    // Subscribe to new notifications
    const subscription = supabase
      .channel('portal_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'portal_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Partial<NotificationItem>;
          if (setNotifications) {
            const notificationWithMessage: Notification = {
              ...newNotification as NotificationItem, 
              message: newNotification.description || '',
              read: false,
              type: newNotification.type || 'info',
              id: newNotification.id || `notification-${Date.now()}`,
              title: newNotification.title || 'Notification',
              timestamp: newNotification.created_at || newNotification.timestamp || new Date().toISOString()
            };
            
            setNotifications([
              notificationWithMessage,
              ...notifications as Notification[]
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, setNotifications, notifications]);

  return { notifications };
};
