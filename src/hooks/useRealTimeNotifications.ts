
import { useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NotificationContext } from '@/contexts/notifications/NotificationContext';
import { NotificationItem } from './useNotifications';
import { useAuth } from '@/contexts/AuthContext';

export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  const { notifications, setNotifications } = useContext(NotificationContext);

  useEffect(() => {
    if (!user) return;

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
          const newNotification = payload.new as NotificationItem;
          setNotifications((prev) => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, setNotifications]);

  return { notifications };
};
