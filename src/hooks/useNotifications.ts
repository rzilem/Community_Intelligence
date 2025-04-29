
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
};

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  type: 'invoice' | 'lead' | 'request' | 'event' | 'message' | 'info' | string;
  severity?: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  route?: string;
  created_at?: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setAllNotifications([]);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // This would be a real query to a notifications table
        // For now, we'll return mock data
        const mockNotifications: Notification[] = [
          {
            id: '1',
            user_id: user.id,
            title: 'Payment Received',
            message: 'Your monthly assessment payment was received.',
            type: 'success',
            is_read: false,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            user_id: user.id,
            title: 'Maintenance Scheduled',
            message: 'Pool maintenance scheduled for tomorrow.',
            type: 'info',
            is_read: false,
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            user_id: user.id,
            title: 'Board Meeting',
            message: 'Upcoming board meeting on Friday at 7PM.',
            type: 'info',
            is_read: true,
            created_at: new Date().toISOString()
          }
        ];
        
        setNotifications(mockNotifications);
        
        // Convert to NotificationItems for the notification center
        const notificationItems: NotificationItem[] = mockNotifications.map(notification => ({
          id: notification.id,
          title: notification.title,
          description: notification.message,
          type: 'info',
          severity: notification.type,
          read: notification.is_read,
          timestamp: notification.created_at,
          route: `/notifications/${notification.id}`
        }));
        
        setAllNotifications(notificationItems);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    // In a real app, this would update the database
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    
    setAllNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    // In a real app, this would update the database
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    );
    
    setAllNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = async (notificationId: string) => {
    // In a real app, this would update the database
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
    
    setAllNotifications(prev =>
      prev.filter(n => n.id !== notificationId)
    );
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.is_read).length;
  };

  const getTotalCount = () => {
    return notifications.length;
  };
  
  const getCountForSection = (section: string) => {
    // In a real app, this would filter by section
    // For now, just return a random number
    return Math.floor(Math.random() * 3);
  };

  return {
    notifications,
    allNotifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
    getTotalCount,
    getCountForSection
  };
};
