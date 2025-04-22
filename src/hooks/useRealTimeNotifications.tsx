
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotificationContext } from '@/contexts/notifications';
import { supabase } from '@/integrations/supabase/client';

// Create context
const NotificationContext = createContext<any>(null);

export const useRealTimeNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setNotifications } = useNotificationContext();
  
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
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();

    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, [setNotifications]);

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};
