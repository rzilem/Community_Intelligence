
import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useHomeownerRequestNotifications } from '@/hooks/homeowners/useHomeownerRequestNotifications';
import { NotificationContextType } from './NotificationContext';
import { NotificationItem } from '@/hooks/useNotifications';

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  deleteNotification: () => {}
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { 
    unreadRequestsCount, 
    markAllAsRead: markAllHomeownerRequestsAsRead 
  } = useHomeownerRequestNotifications();

  // Combine all notifications and calculate total unread count
  useEffect(() => {
    // Set combined unread count
    setUnreadCount((prevCount) => {
      const newCount = unreadRequestsCount;
      // Only update if the count actually changed to prevent render loops
      return prevCount !== newCount ? newCount : prevCount;
    });
  }, [unreadRequestsCount]);

  // Memoize these functions to prevent unnecessary re-renders
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    // Recalculate unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    markAllHomeownerRequestsAsRead();
    setUnreadCount(0);
  }, [markAllHomeownerRequestsAsRead]);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prevNotifications => {
      const notificationToDelete = prevNotifications.find(n => n.id === notificationId);
      const newNotifications = prevNotifications.filter(n => n.id !== notificationId);
      
      // Update unread count if we're removing an unread notification
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return newNotifications;
    });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  }), [notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
