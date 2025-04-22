
import React, { createContext, useContext, useEffect } from 'react';
import { useNotificationContext } from '@/contexts/notifications';
import { supabase } from '@/integrations/supabase/client';
import { NotificationItem } from '@/hooks/useNotifications';

// Create context
const RealTimeNotificationsContext = createContext<ReturnType<typeof useNotificationContext> | null>(null);

export const useRealTimeNotifications = () => {
  const context = useContext(RealTimeNotificationsContext);
  if (!context) {
    throw new Error('useRealTimeNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const notificationContext = useNotificationContext();
  
  useEffect(() => {
    // Set up Supabase real-time subscription for notifications
    const notificationChannel = supabase
      .channel('public:notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        console.log('New notification received:', payload);
        
        // Add the new notification to the existing ones
        const newNotification: NotificationItem = {
          id: payload.new.id,
          user_id: payload.new.user_id,
          title: payload.new.title,
          content: payload.new.content,
          type: payload.new.type,
          association_id: payload.new.association_id,
          created_at: payload.new.created_at,
          read_at: null,
          metadata: payload.new.metadata,
          link: payload.new.link,
          read: false,
          timestamp: payload.new.created_at
        };
        
        notificationContext.setNotifications(prev => [newNotification, ...prev]);
      })
      .subscribe();

    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, [notificationContext.setNotifications]);

  return (
    <RealTimeNotificationsContext.Provider value={notificationContext}>
      {children}
    </RealTimeNotificationsContext.Provider>
  );
};
