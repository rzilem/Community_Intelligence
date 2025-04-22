
import { useState, useEffect } from 'react';
import { useNotificationContext } from '@/contexts/notifications';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeNotifications = () => {
  const notificationContext = useNotificationContext();
  const [notifications, setNotifications] = useState<any[]>([]);

  // Add a notification safely
  const addNotification = (notification: any) => {
    // Check if the context has addNotification method
    if (notificationContext && typeof notificationContext.addNotification === 'function') {
      notificationContext.addNotification(notification);
    } else {
      console.warn('Notification context not available or missing addNotification method');
    }
  };

  // Initialize real-time subscription
  useEffect(() => {
    // Subscribe to notifications
    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, (payload) => {
        console.log('New notification received:', payload);
        // Call the safe addNotification function
        addNotification(payload.new);
      })
      .subscribe();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [notificationContext]);

  return {
    notifications,
    addNotification
  };
};
