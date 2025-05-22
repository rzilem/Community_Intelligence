
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { toast } from 'sonner';

export const useHomeownerRequestNotifications = () => {
  const [unreadRequestsCount, setUnreadRequestsCount] = useState<number>(0);
  const hasShownToast = useRef(false);
  
  // Use localStorage for persistence but keep a ref to the value to avoid re-renders
  const lastCheckedRef = useRef<string>(
    localStorage.getItem('lastHomeownerRequestsCheckTimestamp') || new Date().toISOString()
  );

  // Get recent homeowner requests to check for unread ones
  const { data: recentRequests = [] } = useSupabaseQuery<HomeownerRequest[]>(
    'homeowner_requests',
    {
      select: '*',
      order: { column: 'created_at', ascending: false },
      filter: [
        { column: 'created_at', operator: 'gt', value: lastCheckedRef.current }
      ]
    }
  );

  // Use a stable effect dependency
  const recentRequestsLength = recentRequests.length;
  
  // Update unread count whenever we get new data
  useEffect(() => {
    if (!recentRequests) return;
    
    setUnreadRequestsCount(recentRequestsLength);
    
    // Show toast only once per session for new requests
    if (recentRequestsLength > 0 && !hasShownToast.current) {
      hasShownToast.current = true;
      const message = `${recentRequestsLength} new homeowner request${recentRequestsLength > 1 ? 's' : ''} received`;
      
      toast(message, {
        description: "Check the homeowner requests queue for details",
        action: {
          label: "View",
          onClick: () => {
            window.location.href = '/community-management/homeowner-requests';
            markAllAsRead();
          },
        },
      });
    }
  }, [recentRequestsLength]);

  const markAllAsRead = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem('lastHomeownerRequestsCheckTimestamp', now);
    lastCheckedRef.current = now;
    setUnreadRequestsCount(0);
    hasShownToast.current = false;
  }, []);

  return {
    unreadRequestsCount,
    markAllAsRead
  };
};
