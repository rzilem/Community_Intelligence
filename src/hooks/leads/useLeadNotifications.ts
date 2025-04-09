
import { useState, useEffect } from 'react';
import { Lead } from '@/types/lead-types';
import { useSupabaseQuery } from '@/hooks/supabase';
import { toast } from 'sonner';

export const useLeadNotifications = () => {
  const [unreadLeadsCount, setUnreadLeadsCount] = useState<number>(0);
  const [lastCheckedTimestamp, setLastCheckedTimestamp] = useState<string>(
    localStorage.getItem('lastLeadCheckTimestamp') || new Date().toISOString()
  );

  // Get recent leads to check for unread ones
  const { data: recentLeads = [] } = useSupabaseQuery<Lead[]>(
    'leads' as any,
    {
      select: '*',
      order: { column: 'created_at', ascending: false },
      filter: (query) => query.gt('created_at', lastCheckedTimestamp)
    }
  );

  // Update unread count whenever we get new data
  useEffect(() => {
    setUnreadLeadsCount(recentLeads.length);
    
    // If we have new leads, show a toast
    if (recentLeads.length > 0) {
      toast(`${recentLeads.length} new lead${recentLeads.length > 1 ? 's' : ''} received`, {
        description: "Check the leads dashboard for details",
        action: {
          label: "View",
          onClick: () => {
            window.location.href = '/lead-management/leads';
            markAllAsRead();
          },
        },
      });
    }
  }, [recentLeads]);

  const markAllAsRead = () => {
    const now = new Date().toISOString();
    localStorage.setItem('lastLeadCheckTimestamp', now);
    setLastCheckedTimestamp(now);
    setUnreadLeadsCount(0);
  };

  return {
    unreadLeadsCount,
    markAllAsRead
  };
};
