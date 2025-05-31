
import React, { useState, useCallback, useEffect } from 'react';
import { NotificationContext } from './NotificationContext';
import { useAuth } from '@/contexts/auth';
import { NotificationItem } from '@/hooks/useNotifications';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Initialize notifications only when user changes
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // Set mock notifications once
    const mockNotifications: NotificationItem[] = [
      {
        id: '1',
        title: 'Payment Received',
        description: 'Your monthly assessment payment was received.',
        type: 'invoice',
        severity: 'success',
        read: false,
        timestamp: new Date().toISOString(),
        route: '/payments'
      },
      {
        id: '2',
        title: 'Maintenance Scheduled',
        description: 'Pool maintenance scheduled for tomorrow.',
        type: 'message',
        severity: 'info',
        read: false,
        timestamp: new Date().toISOString(),
        route: '/maintenance'
      },
      {
        id: '3',
        title: 'Board Meeting',
        description: 'Upcoming board meeting on Friday at 7PM.',
        type: 'event',
        severity: 'info',
        read: true,
        timestamp: new Date().toISOString(),
        route: '/events'
      }
    ];

    setNotifications(mockNotifications);
  }, [user?.id]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
