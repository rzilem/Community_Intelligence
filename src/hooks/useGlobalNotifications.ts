import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { useNotifications, NotificationItem } from '@/hooks/useNotifications';
import { useLocation } from 'react-router-dom';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationScope = 'system' | 'association' | 'user';

export interface GlobalNotification extends NotificationItem {
  priority: NotificationPriority;
  scope: NotificationScope;
  expiresAt?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export const useGlobalNotifications = () => {
  const { allNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [globalNotifications, setGlobalNotifications] = useState<GlobalNotification[]>([]);
  const location = useLocation();
  const shownNotificationsRef = useRef(new Set<string>());

  useEffect(() => {
    const convertedNotifications = allNotifications.map(notification => ({
      ...notification,
      priority: getPriorityFromSeverity(notification.severity),
      scope: 'user' as NotificationScope,
    }));
    
    setGlobalNotifications(convertedNotifications);
  }, [allNotifications]);
  
  const getPriorityFromSeverity = (severity?: 'info' | 'success' | 'warning' | 'error'): NotificationPriority => {
    switch (severity) {
      case 'error': return 'urgent';
      case 'warning': return 'high';
      case 'success': return 'low';
      case 'info':
      default:
        return 'medium';
    }
  };
  
  useEffect(() => {
    const highPriorityUnread = globalNotifications.filter(
      n => (n.priority === 'high' || n.priority === 'urgent') && !n.read
    );
    
    highPriorityUnread.forEach(notification => {
      if (!shownNotificationsRef.current.has(notification.id)) {
        const toastMethod = notification.priority === 'urgent' ? toast.error : toast.warning;
        
        toastMethod(notification.title, {
          id: `notification-${notification.id}`,
          description: notification.description,
          action: notification.actionUrl ? {
            label: notification.actionLabel || 'View',
            onClick: () => window.location.href = notification.actionUrl!
          } : undefined,
          onDismiss: () => markAsRead(notification.id)
        });
        
        shownNotificationsRef.current.add(notification.id);
      }
    });
  }, [globalNotifications, markAsRead]);
  
  useEffect(() => {
    const locationRelatedNotifications = globalNotifications.filter(
      n => n.route && n.route === location.pathname
    );
    
    if (locationRelatedNotifications.length > 0) {
      locationRelatedNotifications.forEach(n => markAsRead(n.id));
    }
  }, [location.pathname, globalNotifications, markAsRead]);
  
  const addNotification = (notification: Omit<GlobalNotification, 'id' | 'timestamp' | 'read'>) => {
    const severity = getSeverityFromPriority(notification.priority);
    
    switch (severity) {
      case 'error':
        toast.error(notification.title, { description: notification.description });
        break;
      case 'warning':
        toast.warning(notification.title, { description: notification.description });
        break;
      case 'success':
        toast.success(notification.title, { description: notification.description });
        break;
      default:
        toast.info(notification.title, { description: notification.description });
    }
  };
  
  const getSeverityFromPriority = (priority: NotificationPriority): 'info' | 'success' | 'warning' | 'error' => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'low': return 'success';
      case 'medium':
      default:
        return 'info';
    }
  };
  
  return {
    notifications: globalNotifications,
    unreadCount: globalNotifications.filter(n => !n.read).length,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification
  };
};
