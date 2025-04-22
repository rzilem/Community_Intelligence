
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

export interface FormNotification {
  id: string;
  type: 'submission' | 'approval' | 'comment';
  title: string;
  message: string;
  timestamp: string;
}

export function useRealTimeNotifications() {
  const [notifications, setNotifications] = useState<FormNotification[]>([]);
  const { currentAssociation } = useAuth();

  useEffect(() => {
    if (!currentAssociation?.id) return;

    const channel = supabase
      .channel('form-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'form_templates',
          filter: `association_id=eq.${currentAssociation.id}`
        },
        (payload) => {
          const notification: FormNotification = {
            id: payload.new.id,
            type: 'submission',
            title: 'New Form Submission',
            message: `A new form "${payload.new.name}" has been submitted`,
            timestamp: new Date().toISOString()
          };

          setNotifications(prev => [notification, ...prev]);
          toast.message(notification.title, {
            description: notification.message
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentAssociation?.id]);

  return { notifications };
}
