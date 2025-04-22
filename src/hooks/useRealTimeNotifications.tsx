
import { useEffect, useContext, useState, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NotificationItem, useNotifications } from './useNotifications';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'sonner';

// Create context for global access
export const NotificationContext = createContext<ReturnType<typeof useNotifications>>({
  notifications: [],
  isLoading: false,
  unreadCount: 0,
  markAsRead: () => Promise.resolve(),
  markAllAsRead: () => Promise.resolve(),
  deleteNotification: () => Promise.resolve(),
  setNotifications: () => {}
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const notificationState = useNotifications();
  
  return (
    <NotificationContext.Provider value={notificationState}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  const notificationContext = useContext(NotificationContext);
  const [toastCooldown, setToastCooldown] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Subscribe to new notifications
    const channel = supabase
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
          const newNotification = payload.new as NotificationItem;
          notificationContext.setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast notification only if not in cooldown
          if (!toastCooldown) {
            toast(newNotification.title, {
              description: newNotification.content,
              action: {
                label: 'View',
                onClick: () => {
                  // This would navigate to the notification link if present
                  if (newNotification.link) {
                    window.location.href = newNotification.link;
                  }
                }
              }
            });
            
            // Set cooldown to prevent too many toasts
            setToastCooldown(true);
            setTimeout(() => setToastCooldown(false), 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, notificationContext.setNotifications, toastCooldown]);

  return notificationContext;
};
