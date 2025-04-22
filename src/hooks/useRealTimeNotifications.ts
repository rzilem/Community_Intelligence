
import { useState, useEffect } from 'react';
import { useNotificationContext } from '@/contexts/notifications';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeNotifications = () => {
  const notificationContext = useNotificationContext();
  const [notifications, setNotifications] = useState<any[]>([]);

  // Add a notification safely
  const addNotification = (notification: any) => {
    // Check if the context is available and has notifications
    if (notificationContext) {
      // Instead of using addNotification, we can update the existing notifications
      console.log('Adding notification:', notification);
      
      // If the notification context has a dispatch method, use it
      if (typeof notificationContext.setNotifications === 'function') {
        notificationContext.setNotifications((prev: any[]) => [...prev, notification]);
      } else {
        // As a fallback, we can try to use the markAllAsRead function to trigger a re-render
        console.log('Adding notification to local state');
        setNotifications(prev => [...prev, notification]);
      }
    } else {
      console.warn('Notification context not available');
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
        // Store the notification locally
        setNotifications(prev => [...prev, payload.new]);
        
        // Add to global context if available
        if (payload.new) {
          addNotification(payload.new);
        }
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
