
import React, { useState, useEffect } from 'react';
import { NotificationContext } from './index';
import { NotificationItem } from '@/hooks/useNotifications';
import { v4 as uuidv4 } from 'uuid';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Mark a notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
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
        title: 'New maintenance request',
        type: 'maintenance',
        read: false,
        timestamp: new Date().toISOString(),
        description: 'A new maintenance request has been submitted.'
      },
      {
        id: uuidv4(),
        title: 'Payment received',
        type: 'payment',
        read: false,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        description: 'Payment of $250 has been received.'
      },
      {
        id: uuidv4(),
        title: 'New document uploaded',
        type: 'document',
        read: true,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        description: 'A new document has been uploaded to the portal.'
      },
      {
        id: uuidv4(),
        title: 'Board meeting scheduled',
        type: 'event',
        read: false,
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        description: 'Board meeting scheduled for next Monday.'
      }
    ];
    
    setNotifications(demoNotifications);
  }, []);
  
  // Sort notifications by date (newest first)
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
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
