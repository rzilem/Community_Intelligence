
import React, { useState, useEffect } from 'react';
import { NotificationContext } from './index';
import { NotificationItem } from '@/hooks/useNotifications';
import { v4 as uuidv4 } from 'uuid';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.read_at).length;
  
  // Mark a notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read_at: new Date().toISOString(), read: true } 
          : notification
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ 
        ...notification, 
        read_at: new Date().toISOString(), 
        read: true 
      }))
    );
  };
  
  // Delete a notification
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };
  
  // Add some demo notifications on initial load
  useEffect(() => {
    const demoNotifications: NotificationItem[] = [
      {
        id: uuidv4(),
        user_id: 'system',
        title: 'New maintenance request',
        type: 'maintenance',
        read: false,
        read_at: null,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        content: 'A new maintenance request has been submitted.',
        association_id: 'demo'
      },
      {
        id: uuidv4(),
        user_id: 'system',
        title: 'Payment received',
        type: 'payment',
        read: false,
        read_at: null,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        created_at: new Date(Date.now() - 3600000).toISOString(),
        content: 'Payment of $250 has been received.',
        association_id: 'demo'
      },
      {
        id: uuidv4(),
        user_id: 'system',
        title: 'New document uploaded',
        type: 'document',
        read: true,
        read_at: new Date(Date.now() - 86400000 - 1000).toISOString(),
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
        content: 'A new document has been uploaded to the portal.',
        association_id: 'demo'
      },
      {
        id: uuidv4(),
        user_id: 'system',
        title: 'Board meeting scheduled',
        type: 'event',
        read: false,
        read_at: null,
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        created_at: new Date(Date.now() - 172800000).toISOString(),
        content: 'Board meeting scheduled for next Monday.',
        association_id: 'demo'
      }
    ];
    
    setNotifications(demoNotifications);
  }, []);
  
  // Sort notifications by date (newest first)
  const sortedNotifications = React.useMemo(() => {
    return [...notifications].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [notifications]);
  
  return (
    <NotificationContext.Provider 
      value={{
        notifications: sortedNotifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        setNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
