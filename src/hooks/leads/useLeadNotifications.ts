
import { useState, useEffect, useRef, useCallback } from 'react';
import { Lead } from '@/types/lead-types';
import { useSupabaseQuery } from '@/hooks/supabase';
import { toast } from 'sonner';

export const useLeadNotifications = () => {
  const [unreadLeadsCount, setUnreadLeadsCount] = useState<number>(0);
  const hasShownToast = useRef(false);
  
  // Use localStorage for persistence but keep a ref to the value to avoid re-renders
  const lastCheckedRef = useRef<string>(
    localStorage.getItem('lastLeadCheckTimestamp') || new Date().toISOString()
  );

  // Get recent leads to check for unread ones
  const { data: recentLeads = [] } = useSupabaseQuery<Lead[]>(
    'leads' as any,
    {
      select: '*',
      order: { column: 'created_at', ascending: false },
      filter: [
        { column: 'created_at', operator: 'gt', value: lastCheckedRef.current }
      ]
    }
  );

  // Use a stable effect dependency
  const recentLeadsLength = recentLeads.length;
  
  // Update unread count whenever we get new data
  useEffect(() => {
    if (!recentLeads) return;
    
    setUnreadLeadsCount(recentLeadsLength);
    
    // Show toast only once per session for new leads
    if (recentLeadsLength > 0 && !hasShownToast.current) {
      hasShownToast.current = true;
      toast(`${recentLeadsLength} new lead${recentLeadsLength > 1 ? 's' : ''} received`, {
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
  }, [recentLeadsLength]);

  const markAllAsRead = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem('lastLeadCheckTimestamp', now);
    lastCheckedRef.current = now;
    setUnreadLeadsCount(0);
    hasShownToast.current = false;
  }, []);

  return {
    unreadLeadsCount,
    recentLeads,
    markAllAsRead
  };
};
