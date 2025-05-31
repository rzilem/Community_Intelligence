
import React, { ReactNode, useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
  const isInitialized = useRef(false);
  
  // Get notifications from different sources - these hooks should be stable
  const { unreadLeadsCount, recentLeads, markAllAsRead: markLeadsAsRead } = useLeadNotifications();
  const { unreadInvoicesCount, markAllAsRead: markInvoicesAsRead } = useInvoiceNotifications();
  const { unreadRequestsCount, markAllAsRead: markRequestsAsRead } = useHomeownerRequestNotifications();
  const { unreadEventsCount, markAllAsRead: markEventsAsRead } = useResaleEventNotifications();

  // Create stable callback functions using useCallback with proper dependencies
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    // Call mark as read functions - these should be stable from hooks
    if (markLeadsAsRead) markLeadsAsRead();
    if (markInvoicesAsRead) markInvoicesAsRead();
    if (markRequestsAsRead) markRequestsAsRead();
    if (markEventsAsRead) markEventsAsRead();
  }, [markLeadsAsRead, markInvoicesAsRead, markRequestsAsRead, markEventsAsRead]);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Stable reference for counts to prevent unnecessary updates
  const countsRef = useRef({
    unreadLeadsCount: 0,
    unreadInvoicesCount: 0,
    unreadRequestsCount: 0,
    unreadEventsCount: 0
  });

  // Aggregate notifications with stable dependencies
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      isInitialized.current = false;
      return;
    }

    // Check if counts have actually changed
    const currentCounts = {
      unreadLeadsCount: unreadLeadsCount || 0,
      unreadInvoicesCount: unreadInvoicesCount || 0,
      unreadRequestsCount: unreadRequestsCount || 0,
      unreadEventsCount: unreadEventsCount || 0
    };

    const recentLeadsLength = recentLeads?.length || 0;

    // Only update if something actually changed
    const hasCountsChanged = JSON.stringify(currentCounts) !== JSON.stringify(countsRef.current);
    const hasLeadsChanged = isInitialized.current ? false : recentLeadsLength > 0;

    if (!hasCountsChanged && !hasLeadsChanged && isInitialized.current) {
      return;
    }

    // Update the ref
    countsRef.current = currentCounts;
    isInitialized.current = true;

    const aggregatedNotifications: NotificationItem[] = [];
    
    // Add lead notifications only if there are actual leads
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
    
    // Add other notification types only if counts are greater than 0
    if (currentCounts.unreadInvoicesCount > 0) {
      aggregatedNotifications.push({
        id: `invoice-batch-${currentCounts.unreadInvoicesCount}`,
        title: `${currentCounts.unreadInvoicesCount} New Invoice(s) Received`,
        description: 'Review pending invoices',
        type: 'invoice',
        severity: 'info',
        read: false,
        timestamp: new Date().toISOString(),
        route: '/accounting/invoice-queue'
      });
    }
    
    if (currentCounts.unreadRequestsCount > 0) {
      aggregatedNotifications.push({
        id: `request-batch-${currentCounts.unreadRequestsCount}`,
        title: `${currentCounts.unreadRequestsCount} New Homeowner Request(s)`,
        description: 'Homeowner requests need attention',
        type: 'request',
        severity: 'info',
        read: false,
        timestamp: new Date().toISOString(),
        route: '/community-management/homeowner-requests'
      });
    }
    
    if (currentCounts.unreadEventsCount > 0) {
      aggregatedNotifications.push({
        id: `event-batch-${currentCounts.unreadEventsCount}`,
        title: `${currentCounts.unreadEventsCount} Resale Calendar Update(s)`,
        description: 'New events on the resale calendar',
        type: 'event',
        severity: 'info',
        read: false,
        timestamp: new Date().toISOString(),
        route: '/resale-management/calendar'
      });
    }
    
    // Sort by timestamp (newest first)
    const sortedNotifications = aggregatedNotifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    setNotifications(sortedNotifications);
  }, [user?.id, unreadInvoicesCount, unreadRequestsCount, unreadEventsCount, unreadLeadsCount]); // Only depend on primitive values

  // Memoize the unread count to prevent recalculation on every render
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length
  , [notifications]);

  // Memoize context value to prevent unnecessary re-renders with stable dependencies
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
