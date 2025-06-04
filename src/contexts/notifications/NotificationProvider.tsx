
import React, { ReactNode, useEffect, useState, useCallback, useMemo } from 'react';
import { NotificationContext } from './NotificationContext';
import { NotificationItem } from '@/hooks/useNotifications';
import { useLeadNotifications } from '@/hooks/leads/useLeadNotifications';
import { useInvoiceNotifications } from '@/hooks/invoices/useInvoiceNotifications';
import { useHomeownerRequestNotifications } from '@/hooks/homeowners/useHomeownerRequestNotifications';
import { useResaleEventNotifications } from '@/hooks/resale/useResaleEventNotifications';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/client-logger';

interface NotificationProviderProps {
  children: ReactNode;
}

// Initialize logger only once outside the component
logger.init();

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { user } = useAuth();
  
  // Get notifications from different sources - these hooks should be stable
  const { unreadLeadsCount, recentLeads, markAllAsRead: markLeadsAsRead } = useLeadNotifications();
  const { unreadInvoicesCount, markAllAsRead: markInvoicesAsRead } = useInvoiceNotifications();
  const { unreadRequestsCount, markAllAsRead: markRequestsAsRead } = useHomeownerRequestNotifications();
  const { unreadEventsCount, markAllAsRead: markEventsAsRead } = useResaleEventNotifications();

  // Extract counts into a stable reference to avoid excess re-renders
  const notificationCounts = useMemo(() => ({
    leads: unreadLeadsCount || 0,
    invoices: unreadInvoicesCount || 0,
    requests: unreadRequestsCount || 0,
    events: unreadEventsCount || 0
  }), [unreadLeadsCount, unreadInvoicesCount, unreadRequestsCount, unreadEventsCount]);
  
  // Create a memoized aggregateNotifications function
  const aggregatedNotifications = useMemo(() => {
    if (!user) {
      return [];
    }

    const aggregatedNotifications: NotificationItem[] = [];
    
    // Add lead notifications
    if (recentLeads && recentLeads.length > 0) {
      recentLeads.forEach(lead => {
        aggregatedNotifications.push({
          id: `lead-${lead.id}`,
          title: `New Lead: ${lead.name || 'Unnamed Lead'}`,
          description: lead.association_name || lead.city || 'No location provided',
          type: 'lead',
          severity: 'info',
          read: false,
          timestamp: lead.created_at,
          route: `/lead-management/leads?id=${lead.id}`
        });
      });
    }
    
    // Add mock notifications for other types
    if (notificationCounts.invoices > 0) {
      aggregatedNotifications.push({
        id: `invoice-batch-${Date.now()}`,
        title: `${notificationCounts.invoices} New Invoice(s) Received`,
        description: 'Review pending invoices',
        type: 'invoice',
        severity: 'info',
        read: false,
        timestamp: new Date().toISOString(),
        route: '/accounting/invoice-queue'
      });
    }
    
    if (notificationCounts.requests > 0) {
      aggregatedNotifications.push({
        id: `request-batch-${Date.now()}`,
        title: `${notificationCounts.requests} New Homeowner Request(s)`,
        description: 'Homeowner requests need attention',
        type: 'request',
        severity: 'info',
        read: false,
        timestamp: new Date().toISOString(),
        route: '/community-management/homeowner-requests'
      });
    }
    
    if (notificationCounts.events > 0) {
      aggregatedNotifications.push({
        id: `event-batch-${Date.now()}`,
        title: `${notificationCounts.events} Resale Calendar Update(s)`,
        description: 'New events on the resale calendar',
        type: 'event',
        severity: 'info',
        read: false,
        timestamp: new Date().toISOString(),
        route: '/resale-management/calendar'
      });
    }
    
    // Sort by timestamp (newest first)
    return aggregatedNotifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [user, recentLeads, notificationCounts]);

  // Update notifications only when the memoized function output changes
  useEffect(() => {
    setNotifications(aggregatedNotifications);
  }, [aggregatedNotifications]);

  // Memoize callback functions to maintain stable references
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    // Execute these stable functions
    markLeadsAsRead();
    markInvoicesAsRead();
    markRequestsAsRead();
    markEventsAsRead();
  }, [markLeadsAsRead, markInvoicesAsRead, markRequestsAsRead, markEventsAsRead]);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Memoize the unread count so it doesn't recalculate on every render
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length
  , [notifications]);

  // Memoize context value to prevent unnecessary re-renders
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
