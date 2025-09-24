
import React, { ReactNode, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { NotificationContext } from './NotificationContext';
import { NotificationItem } from '@/hooks/useNotifications';
import { useLeadNotifications } from '@/hooks/leads/useLeadNotifications';
import { useInvoiceNotifications } from '@/hooks/invoices/useInvoiceNotifications';
import { useHomeownerRequestNotifications } from '@/hooks/homeowners/useHomeownerRequestNotifications';
import { useResaleEventNotifications } from '@/hooks/resale/useResaleEventNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/client-logger';

interface NotificationProviderProps {
  children: ReactNode;
}

// Initialize logger only once outside the component
logger.init();

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [updateCount, setUpdateCount] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const timestampRef = useRef<string>(new Date().toISOString());
  const { user } = useAuth();

  // Circuit breaker - prevent infinite loops
  useEffect(() => {
    setUpdateCount(prev => {
      const newCount = prev + 1;
      if (newCount > 10) {
        console.warn('🚨 NotificationProvider: Too many updates detected - enabling circuit breaker');
        setDisabled(true);
      }
      return newCount;
    });
  }, [notifications]);

  // Reset circuit breaker after a delay
  useEffect(() => {
    if (disabled) {
      const timer = setTimeout(() => {
        console.log('🔄 NotificationProvider: Resetting circuit breaker');
        setDisabled(false);
        setUpdateCount(0);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [disabled]);

  // Early return if circuit breaker is active
  if (disabled) {
    console.log('⚡ NotificationProvider: Circuit breaker active - providing minimal context');
    const minimalContext = useMemo(() => ({
      notifications: [],
      unreadCount: 0,
      markAsRead: () => {},
      markAllAsRead: () => {},
      deleteNotification: () => {}
    }), []);
    
    return (
      <NotificationContext.Provider value={minimalContext}>
        {children}
      </NotificationContext.Provider>
    );
  }
  
  // Get notifications from different sources with error handling
  let notificationHooks;
  try {
    const { unreadLeadsCount, recentLeads, markAllAsRead: markLeadsAsRead } = useLeadNotifications();
    const { unreadInvoicesCount, markAllAsRead: markInvoicesAsRead } = useInvoiceNotifications();
    const { unreadRequestsCount, markAllAsRead: markRequestsAsRead } = useHomeownerRequestNotifications();
    const { unreadEventsCount, markAllAsRead: markEventsAsRead } = useResaleEventNotifications();
    
    notificationHooks = {
      unreadLeadsCount: unreadLeadsCount || 0,
      recentLeads: recentLeads || [],
      markLeadsAsRead,
      unreadInvoicesCount: unreadInvoicesCount || 0,
      markInvoicesAsRead,
      unreadRequestsCount: unreadRequestsCount || 0,
      markRequestsAsRead,
      unreadEventsCount: unreadEventsCount || 0,
      markEventsAsRead
    };
  } catch (error) {
    console.error('🚨 NotificationProvider: Error in notification hooks:', error);
    // Provide safe defaults if hooks fail
    notificationHooks = {
      unreadLeadsCount: 0,
      recentLeads: [],
      markLeadsAsRead: () => {},
      unreadInvoicesCount: 0,
      markInvoicesAsRead: () => {},
      unreadRequestsCount: 0,
      markRequestsAsRead: () => {},
      unreadEventsCount: 0,
      markEventsAsRead: () => {}
    };
  }

  // Extract counts into a stable reference to avoid excess re-renders
  const notificationCounts = useMemo(() => ({
    leads: notificationHooks.unreadLeadsCount,
    invoices: notificationHooks.unreadInvoicesCount,
    requests: notificationHooks.unreadRequestsCount,
    events: notificationHooks.unreadEventsCount
  }), [notificationHooks.unreadLeadsCount, notificationHooks.unreadInvoicesCount, notificationHooks.unreadRequestsCount, notificationHooks.unreadEventsCount]);
  
  // Create a memoized aggregateNotifications function
  const aggregatedNotifications = useMemo(() => {
    if (!user) {
      return [];
    }

    const aggregatedNotifications: NotificationItem[] = [];
    
    // Add lead notifications
    if (notificationHooks.recentLeads && notificationHooks.recentLeads.length > 0) {
      notificationHooks.recentLeads.forEach(lead => {
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
    
    // Add stable notifications for other types using fixed timestamp
    if (notificationCounts.invoices > 0) {
      aggregatedNotifications.push({
        id: `invoice-batch-stable`,
        title: `${notificationCounts.invoices} New Invoice(s) Received`,
        description: 'Review pending invoices',
        type: 'invoice',
        severity: 'info',
        read: false,
        timestamp: timestampRef.current,
        route: '/accounting/invoice-queue'
      });
    }
    
    if (notificationCounts.requests > 0) {
      aggregatedNotifications.push({
        id: `request-batch-stable`,
        title: `${notificationCounts.requests} New Homeowner Request(s)`,
        description: 'Homeowner requests need attention',
        type: 'request',
        severity: 'info',
        read: false,
        timestamp: timestampRef.current,
        route: '/community-management/homeowner-requests'
      });
    }
    
    if (notificationCounts.events > 0) {
      aggregatedNotifications.push({
        id: `event-batch-stable`,
        title: `${notificationCounts.events} Resale Calendar Update(s)`,
        description: 'New events on the resale calendar',
        type: 'event',
        severity: 'info',
        read: false,
        timestamp: timestampRef.current,
        route: '/resale-management/calendar'
      });
    }
    
    // Sort by timestamp (newest first)
    return aggregatedNotifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [user, notificationHooks.recentLeads, notificationCounts]);

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
    
    // Execute these stable functions safely
    try {
      notificationHooks.markLeadsAsRead();
      notificationHooks.markInvoicesAsRead();
      notificationHooks.markRequestsAsRead();
      notificationHooks.markEventsAsRead();
    } catch (error) {
      console.error('🚨 Error in markAllAsRead:', error);
    }
  }, [notificationHooks.markLeadsAsRead, notificationHooks.markInvoicesAsRead, notificationHooks.markRequestsAsRead, notificationHooks.markEventsAsRead]);

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
