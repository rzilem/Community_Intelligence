
import { useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { toast } from 'sonner';

export const useHomeownerRequestNotifications = () => {
  const [unreadRequestsCount, setUnreadRequestsCount] = useState<number>(0);
  const [lastCheckedTimestamp, setLastCheckedTimestamp] = useState<string>(
    localStorage.getItem('lastHomeownerRequestsCheckTimestamp') || new Date().toISOString()
  );

  // Get recent homeowner requests to check for unread ones
  const { data: recentRequests = [] } = useSupabaseQuery<HomeownerRequest[]>(
    'homeowner_requests',
    {
      select: '*',
      order: { column: 'createdAt', ascending: false },
      filter: [
        { column: 'createdAt', operator: 'gt', value: lastCheckedTimestamp }
      ]
    }
  );

  // Update unread count whenever we get new data
  useEffect(() => {
    setUnreadRequestsCount(recentRequests.length);
    
    // If we have new requests, show a toast
    if (recentRequests.length > 0) {
      toast(`${recentRequests.length} new homeowner request${recentRequests.length > 1 ? 's' : ''} received`, {
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
  }, [recentRequests]);

  const markAllAsRead = () => {
    const now = new Date().toISOString();
    localStorage.setItem('lastHomeownerRequestsCheckTimestamp', now);
    setLastCheckedTimestamp(now);
    setUnreadRequestsCount(0);
  };

  return {
    unreadRequestsCount,
    markAllAsRead
  };
};
