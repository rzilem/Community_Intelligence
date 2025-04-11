
import { useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { ResaleEvent } from '@/types/resale-event-types';
import { toast } from 'sonner';

export const useResaleEventNotifications = () => {
  const [unreadEventsCount, setUnreadEventsCount] = useState<number>(0);
  const [lastCheckedTimestamp, setLastCheckedTimestamp] = useState<string>(
    localStorage.getItem('lastResaleEventsCheckTimestamp') || new Date().toISOString()
  );

  // Get recent resale events to check for unread ones
  const { data: recentEvents = [] } = useSupabaseQuery<ResaleEvent[]>(
    'resale_events',
    {
      select: '*',
      order: { column: 'date', ascending: false },
      filter: [
        { column: 'date', operator: 'gt', value: lastCheckedTimestamp }
      ]
    }
  );

  // Update unread count whenever we get new data
  useEffect(() => {
    setUnreadEventsCount(recentEvents.length);
    
    // If we have new events, show a toast
    if (recentEvents.length > 0) {
      toast(`${recentEvents.length} new resale event${recentEvents.length > 1 ? 's' : ''} received`, {
        description: "Check the resale calendar for details",
        action: {
          label: "View",
          onClick: () => {
            window.location.href = '/resale-management/calendar';
            markAllAsRead();
          },
        },
      });
    }
  }, [recentEvents]);

  const markAllAsRead = () => {
    const now = new Date().toISOString();
    localStorage.setItem('lastResaleEventsCheckTimestamp', now);
    setLastCheckedTimestamp(now);
    setUnreadEventsCount(0);
  };

  return {
    unreadEventsCount,
    markAllAsRead
  };
};
