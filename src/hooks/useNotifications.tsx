
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: string;
  association_id: string;
  created_at: string;
  read_at?: string | null;
  metadata?: any;
  link?: string;
  
  // Additional properties needed by components
  read?: boolean;
  route?: string;
  description?: string;
  timestamp?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('portal_notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          return;
        }

        if (data) {
          // Transform the data to match the NotificationItem interface
          const transformedData = data.map(item => ({
            ...item,
            read: !!item.read_at,
            timestamp: item.created_at,
            // Map any relevant metadata to route if needed
            route: item.link || ''
          }));
          
          setNotifications(transformedData);
          setUnreadCount(transformedData.filter(n => !n.read_at).length);
        }
      } catch (error) {
        console.error('Unexpected error in fetchNotifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('portal_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'portal_notifications'
        },
        fetchNotifications
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('portal_notifications')
        .update({ read_at: new Date().toISOString() })
        .match({ id: notificationId });

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString(), read: true }
            : n
        )
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Unexpected error in markAsRead:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id);
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('portal_notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadIds);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n =>
          !n.read_at
            ? { ...n, read_at: new Date().toISOString(), read: true }
            : n
        )
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Unexpected error in markAllAsRead:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('portal_notifications')
        .delete()
        .match({ id: notificationId });

      if (error) {
        console.error('Error deleting notification:', error);
        return;
      }

      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.read_at) {
        setUnreadCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Unexpected error in deleteNotification:', error);
    }
  };

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setNotifications
  };
};
