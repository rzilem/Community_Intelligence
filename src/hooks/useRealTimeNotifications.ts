
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useRealTimeNotifications() {
  useEffect(() => {
    // Only set up listeners if user is authenticated
    const setupNotificationListeners = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        // Set up subscription to portal_notifications table
        const notificationSubscription = supabase
          .channel('portal_notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'portal_notifications',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              const notification = payload.new;
              
              toast(
                notification.title,
                {
                  description: notification.content,
                  action: notification.link ? {
                    label: 'View',
                    onClick: () => window.location.href = notification.link
                  } : undefined
                }
              );
            }
          )
          .subscribe();
          
        return () => {
          supabase.removeChannel(notificationSubscription);
        };
      } catch (error) {
        console.error('Error setting up notification listeners:', error);
      }
    };

    setupNotificationListeners();
  }, []);
  
  return null;
}
