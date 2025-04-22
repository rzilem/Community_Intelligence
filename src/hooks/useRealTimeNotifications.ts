
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationContext } from '@/contexts/notifications';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useRealTimeNotifications = () => {
  const { addNotification } = useNotificationContext() || { addNotification: () => {} };
  const { user, currentAssociation } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!user || !currentAssociation || isSubscribed) return;

    // Subscribe to homeowner requests
    const requestsSubscription = supabase
      .channel('homeowner-requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'homeowner_requests',
          filter: `association_id=eq.${currentAssociation.id}`
        },
        (payload) => {
          const newRequest = payload.new;
          if (addNotification) {
            addNotification({
              id: newRequest.id,
              title: 'New Request',
              message: `A new request has been submitted: ${newRequest.title}`,
              type: 'request',
              createdAt: new Date().toISOString(),
              read: false,
              data: newRequest
            });
          }
          
          toast.info(`New request: ${newRequest.title}`);
        }
      )
      .subscribe();

    // Subscribe to calendar events
    const eventsSubscription = supabase
      .channel('calendar-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'calendar_events',
          filter: `hoa_id=eq.${currentAssociation.id}`
        },
        (payload) => {
          const newEvent = payload.new;
          if (addNotification) {
            addNotification({
              id: newEvent.id,
              title: 'New Calendar Event',
              message: `A new event has been added: ${newEvent.title}`,
              type: 'event',
              createdAt: new Date().toISOString(),
              read: false,
              data: newEvent
            });
          }
          
          toast.info(`New calendar event: ${newEvent.title}`);
        }
      )
      .subscribe();

    setIsSubscribed(true);

    return () => {
      requestsSubscription.unsubscribe();
      eventsSubscription.unsubscribe();
    };
  }, [user, currentAssociation, addNotification, isSubscribed]);
};
