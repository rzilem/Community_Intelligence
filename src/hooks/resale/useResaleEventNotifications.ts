
import { useState, useEffect, useRef } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { toast } from 'sonner';

export interface ResaleEvent {
  id: string;
  title: string;
  event_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useResaleEventNotifications = () => {
  const [unreadEventsCount, setUnreadEventsCount] = useState<number>(0);
  const [lastCheckedTimestamp, setLastCheckedTimestamp] = useState<string>(
    localStorage.getItem('lastResaleEventCheckTimestamp') || new Date().toISOString()
  );
  
  // Use a ref to prevent unnecessary re-renders
  const hasShownToast = useRef<boolean>(false);

  // Get recent resale events to check for unread ones
  const { data: recentEvents = [] } = useSupabaseQuery<ResaleEvent[]>(
    'resale_events',
    {
      select: '*',
      order: { column: 'created_at', ascending: false },
      filter: [
        { column: 'created_at', operator: 'gt', value: lastCheckedTimestamp }
      ]
    }
  );

  // Update unread count whenever we get new data
  useEffect(() => {
    // Skip processing if no timestamp or no events
    if (!lastCheckedTimestamp || !recentEvents || !recentEvents.length) return;
    
    // Only update if we haven't shown a toast yet
    if (!hasShownToast.current) {
      setUnreadEventsCount(recentEvents.length);
      
      // Only show toast for new events and only once
      if (recentEvents.length > 0) {
        hasShownToast.current = true;
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
    }
  }, [recentEvents, lastCheckedTimestamp]);

  // Reset the toast flag when navigating away
  useEffect(() => {
    return () => {
      hasShownToast.current = false;
    };
  }, []);

  const markAllAsRead = () => {
    const now = new Date().toISOString();
    localStorage.setItem('lastResaleEventCheckTimestamp', now);
    setLastCheckedTimestamp(now);
    setUnreadEventsCount(0);
    hasShownToast.current = false;
  };

  return {
    unreadEventsCount,
    markAllAsRead
  };
};
