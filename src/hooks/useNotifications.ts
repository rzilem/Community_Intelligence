
import { useState, useEffect } from 'react';
import { useInvoiceNotifications } from '@/hooks/invoices/useInvoiceNotifications';
import { useLeadNotifications } from '@/hooks/leads/useLeadNotifications';
import { useHomeownerRequestNotifications } from '@/hooks/homeowners/useHomeownerRequestNotifications';
import { useResaleEventNotifications } from '@/hooks/resale/useResaleEventNotifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SectionNotifications {
  [key: string]: number;
}

export interface NotificationItem {
  id: string;
  type: 'invoice' | 'lead' | 'request' | 'event' | 'message' | 'announcement' | 'other';
  title: string;
  description?: string;
  timestamp: Date;
  read: boolean;
  resourceId?: string;
  resourceType?: string;
  route?: string;
}

export const useNotifications = () => {
  const [sectionCounts, setSectionCounts] = useState<SectionNotifications>({});
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const { unreadLeadsCount, recentLeads = [], markAllAsRead: markAllLeadsAsRead } = useLeadNotifications();
  const { unreadInvoicesCount, markAllAsRead: markAllInvoicesAsRead } = useInvoiceNotifications();
  const { unreadRequestsCount, markAllAsRead: markAllRequestsAsRead } = useHomeownerRequestNotifications();
  const { unreadEventsCount, markAllAsRead: markAllEventsAsRead } = useResaleEventNotifications();
  
  useEffect(() => {
    if (!isSubscribed) {
      const channel = supabase
        .channel('notifications')
        .on('broadcast', { event: 'new-notification' }, (payload) => {
          const newNotification = payload.payload as NotificationItem;
          
          toast(newNotification.title, {
            description: newNotification.description,
            action: newNotification.route ? {
              label: "View",
              onClick: () => {
                window.location.href = newNotification.route || '/';
              }
            } : undefined
          });
          
          setAllNotifications(prev => [newNotification, ...prev]);
        })
        .subscribe();
      
      setIsSubscribed(true);
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isSubscribed]);
  
  useEffect(() => {
    const leadNotifications: NotificationItem[] = recentLeads.map(lead => ({
      id: lead.id,
      type: 'lead',
      title: `New lead: ${lead.name || lead.email}`,
      description: `${lead.source || 'Website'} - ${lead.status}`,
      timestamp: new Date(lead.created_at),
      read: false,
      resourceId: lead.id,
      resourceType: 'lead',
      route: `/lead-management/leads/${lead.id}`
    }));
    
    setAllNotifications(prev => [...leadNotifications, ...prev]);
  }, [recentLeads]);
  
  useEffect(() => {
    const counts: SectionNotifications = {
      'lead-management': unreadLeadsCount,
      'accounting': unreadInvoicesCount,
      'community-management': unreadRequestsCount,
      'resale-management': unreadEventsCount,
      'communications': 3
    };
    
    setSectionCounts(counts);
  }, [unreadLeadsCount, unreadInvoicesCount, unreadRequestsCount, unreadEventsCount]);

  const getCountForSection = (section: string): number => {
    return sectionCounts[section] || 0;
  };
  
  const getTotalCount = (): number => {
    return Object.values(sectionCounts).reduce((total, count) => total + count, 0);
  };
  
  const markAllAsRead = () => {
    markAllLeadsAsRead();
    markAllInvoicesAsRead();
    markAllRequestsAsRead();
    markAllEventsAsRead();
    
    setAllNotifications(prev => prev.map(item => ({ ...item, read: true })));
  };
  
  const markAsRead = (id: string, type: string) => {
    switch (type) {
      case 'lead':
        break;
      case 'invoice':
        break;
      default:
        break;
    }
    
    setAllNotifications(prev => 
      prev.map(item => item.id === id ? { ...item, read: true } : item)
    );
  };

  return {
    sectionCounts,
    getCountForSection,
    getTotalCount,
    allNotifications,
    markAllAsRead,
    markAsRead
  };
};
