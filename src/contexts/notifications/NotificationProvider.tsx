
import React, { useEffect, useState } from 'react';
import { NotificationContext } from './index';
import { NotificationItem } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('portal_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          return;
        }

        if (data) {
          const transformedData = data.map(item => ({
            ...item,
            read: !!item.read_at,
            timestamp: item.created_at,
            route: item.link || ''
          }));
          
          setNotifications(transformedData);
          setUnreadCount(transformedData.filter(n => !n.read_at).length);
        }
      } catch (error) {
        console.error('Unexpected error in fetchNotifications:', error);
      }
    };

    fetchNotifications();

    // Demo notifications
    const demoNotifications: NotificationItem[] = [
      {
        id: 'demo-1',
        user_id: user?.id || '',
        title: 'New invoice generated',
        content: 'April 2025 HOA dues invoice has been generated',
        type: 'invoice',
        association_id: 'demo-assoc',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        route: '/accounting/invoices'
      },
      {
        id: 'demo-2',
        user_id: user?.id || '',
        title: 'Maintenance request update',
        content: 'Your maintenance request #MR-2025-042 has been assigned to a technician',
        type: 'request',
        association_id: 'demo-assoc',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        read: true,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        route: '/maintenance/requests'
      },
      {
        id: 'demo-3',
        user_id: user?.id || '',
        title: 'New community poll',
        content: 'The board has created a new poll about community improvements',
        type: 'event',
        association_id: 'demo-assoc',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        read: false,
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        route: '/community/polls'
      },
      {
        id: 'demo-4',
        user_id: user?.id || '',
        title: 'New direct message',
        content: 'You have received a message from the Property Manager',
        type: 'message',
        association_id: 'demo-assoc',
        created_at: new Date(Date.now() - 259200000).toISOString(),
        read: false,
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        route: '/communications/messages'
      }
    ];

    // Add demo notifications if no real ones exist
    if (!data || data.length === 0) {
      setNotifications(demoNotifications);
      setUnreadCount(demoNotifications.filter(n => !n.read).length);
    }

    // Subscribe to new notifications
    const channel = supabase
      .channel('portal_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'portal_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as NotificationItem;
          const transformedNotification = {
            ...newNotification,
            read: false,
            timestamp: newNotification.created_at,
            route: newNotification.link || ''
          };
          
          setNotifications(prev => [transformedNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      // If it's a demo notification, just update the state
      if (notificationId.startsWith('demo-')) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId
              ? { ...n, read: true, read_at: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return;
      }

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
            ? { ...n, read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Unexpected error in markAsRead:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Update demo notifications
      const demoNotifications = notifications.filter(n => n.id.startsWith('demo-') && !n.read);
      const realUnreadIds = notifications
        .filter(n => !n.id.startsWith('demo-') && !n.read_at)
        .map(n => n.id);

      // Update real notifications in database if any
      if (realUnreadIds.length > 0) {
        const { error } = await supabase
          .from('portal_notifications')
          .update({ read_at: new Date().toISOString() })
          .in('id', realUnreadIds);

        if (error) {
          console.error('Error marking all notifications as read:', error);
        }
      }

      // Update state for all notifications
      setNotifications(prev =>
        prev.map(n =>
          !n.read || !n.read_at
            ? { ...n, read: true, read_at: new Date().toISOString() }
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
      // If it's a demo notification, just update the state
      if (notificationId.startsWith('demo-')) {
        const notificationToDelete = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        if (notificationToDelete && !notificationToDelete.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        return;
      }

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
      
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Unexpected error in deleteNotification:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
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
