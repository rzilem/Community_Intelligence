
import React, { ReactNode, useEffect, useState, useCallback } from 'react';
import { NotificationContext, Notification } from './NotificationContext';
import { NotificationItem } from '@/hooks/useNotifications';
import { useLeadNotifications } from '@/hooks/leads/useLeadNotifications';
import { useInvoiceNotifications } from '@/hooks/invoices/useInvoiceNotifications';
import { useHomeownerRequestNotifications } from '@/hooks/homeowners/useHomeownerRequestNotifications';
import { useResaleEventNotifications } from '@/hooks/resale/useResaleEventNotifications';
import { useAuth } from '@/contexts/auth';

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  
  // Get notifications from different sources
  const { unreadLeadsCount, recentLeads, markAllAsRead: markLeadsAsRead } = useLeadNotifications();
  const { unreadInvoicesCount, markAllAsRead: markInvoicesAsRead } = useInvoiceNotifications();
  const { unreadRequestsCount, markAllAsRead: markRequestsAsRead } = useHomeownerRequestNotifications();
  const { unreadEventsCount, markAllAsRead: markEventsAsRead } = useResaleEventNotifications();

  // Memoized function to aggregate notifications
  const aggregateNotifications = useCallback(() => {
    if (!user) {
      return [];
    }

    const aggregatedNotifications: Notification[] = [];
    
    // Add lead notifications
    if (recentLeads && recentLeads.length > 0) {
      recentLeads.forEach(lead => {
        aggregatedNotifications.push({
          id: `lead-${lead.id}`,
          title: `New Lead: ${lead.name || 'Unnamed Lead'}`,
          description: lead.association_name || lead.city || 'No location provided',
          message: lead.association_name || lead.city || 'No location provided',
          type: 'lead',
          severity: 'info',
          read: false,
          timestamp: lead.created_at,
          route: `/lead-management/leads?id=${lead.id}`
        });
      });
    }
    
    // Add mock notifications for other types
    if (unreadInvoicesCount > 0) {
      for (let i = 0; i < unreadInvoicesCount; i++) {
        aggregatedNotifications.push({
          id: `invoice-${i}`,
          title: `New Invoice Received`,
          description: 'Review pending invoice',
          message: 'Review pending invoice',
          type: 'invoice',
          severity: 'info',
          read: false,
          timestamp: new Date().toISOString(),
          route: '/accounting/invoice-queue'
        });
      }
    }
    
    if (unreadRequestsCount > 0) {
      for (let i = 0; i < unreadRequestsCount; i++) {
        aggregatedNotifications.push({
          id: `request-${i}`,
          title: 'New Homeowner Request',
          description: 'Homeowner request needs attention',
          message: 'Homeowner request needs attention',
          type: 'request',
          severity: 'info',
          read: false,
          timestamp: new Date().toISOString(),
          route: '/community-management/homeowner-requests'
        });
      }
    }
    
    if (unreadEventsCount > 0) {
      for (let i = 0; i < unreadEventsCount; i++) {
        aggregatedNotifications.push({
          id: `event-${i}`,
          title: 'Resale Calendar Update',
          description: 'New event on the resale calendar',
          message: 'New event on the resale calendar',
          type: 'event',
          severity: 'info',
          read: false,
          timestamp: new Date().toISOString(),
          route: '/resale-management/calendar'
        });
      }
    }
    
    // Sort by timestamp (newest first)
    return aggregatedNotifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [user, unreadLeadsCount, unreadInvoicesCount, unreadRequestsCount, unreadEventsCount, recentLeads]);

  // Update notifications when dependencies change
  useEffect(() => {
    setNotifications(aggregateNotifications());
  }, [aggregateNotifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    markLeadsAsRead();
    markInvoicesAsRead();
    markRequestsAsRead();
    markEventsAsRead();
  }, [markLeadsAsRead, markInvoicesAsRead, markRequestsAsRead, markEventsAsRead]);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Safe type casting for setNotifications
  const setNotificationsHandler = useCallback((newNotifications: Notification[]) => {
    setNotifications(newNotifications);
  }, []);

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        deleteNotification,
        setNotifications: setNotificationsHandler 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
