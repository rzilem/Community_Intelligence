import { useState, useEffect, useRef, useCallback } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  const hasShownToast = useRef(false);
  const navigate = useNavigate();
  
  // Use localStorage for persistence but keep a ref to the value to avoid re-renders
  const lastCheckedRef = useRef<string>(
    localStorage.getItem('lastResaleEventCheckTimestamp') || new Date().toISOString()
  );

  // Get recent resale events to check for unread ones with error handling
  const { data: recentEvents = [] } = useSupabaseQuery<ResaleEvent[]>(
    'resale_events',
    {
      select: '*',
      order: { column: 'created_at', ascending: false },
      filter: [
        { column: 'created_at', operator: 'gt', value: lastCheckedRef.current }
      ],
      onError: (error) => {
        console.warn('📊 Resale events table not found or query failed:', error);
        // Return empty array to prevent hook failures
      }
    }
  );

  // Use a stable effect dependency
  const recentEventsLength = recentEvents.length;

  // Update unread count whenever we get new data
  useEffect(() => {
    if (!recentEvents) return;
    
    setUnreadEventsCount(recentEventsLength);
    
    // Show toast only once per session for new events
    if (recentEventsLength > 0 && !hasShownToast.current) {
      hasShownToast.current = true;
      toast(`${recentEventsLength} new resale event${recentEventsLength > 1 ? 's' : ''} received`, {
        description: "Check the resale calendar for details",
        action: {
          label: "View",
          onClick: () => {
            navigate('/resale-management/calendar');
            markAllAsRead();
          },
        },
      });
    }
  }, [recentEventsLength]);

  const markAllAsRead = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem('lastResaleEventCheckTimestamp', now);
    lastCheckedRef.current = now;
    setUnreadEventsCount(0);
    hasShownToast.current = false;
  }, []);

  return {
    unreadEventsCount,
    markAllAsRead
  };
};
