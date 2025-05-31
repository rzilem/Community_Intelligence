
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NotificationTemplate, NotificationQueue } from '@/types/notification-types';

export const useNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [queue, setQueue] = useState<NotificationQueue[]>([]);

  const createTemplate = useCallback(async (templateData: Partial<NotificationTemplate>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .insert([templateData])
        .select('*')
        .single();

      if (error) throw error;

      setTemplates(prev => [data, ...prev]);
      toast.success('Notification template created successfully!');
      return data;
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast.error('Failed to create notification template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendNotification = useCallback(async (
    templateId: string,
    recipientId: string,
    recipientType: 'resident' | 'property_manager' | 'board_member' | 'maintenance',
    variables: Record<string, any> = {}
  ) => {
    setIsLoading(true);
    try {
      // Get template
      const { data: template, error: templateError } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      // Queue notification
      const { data, error } = await supabase
        .from('notification_queue')
        .insert([{
          template_id: templateId,
          recipient_type: recipientType,
          recipient_id: recipientId,
          variables,
          status: 'queued',
          scheduled_at: new Date().toISOString()
        }])
        .select('*')
        .single();

      if (error) throw error;

      // AI-optimized timing (mock implementation)
      const optimizedDelay = calculateOptimalSendTime(recipientType, template.category);
      
      // Process notification with AI optimization
      setTimeout(async () => {
        await processNotification(data.id, template, variables);
      }, optimizedDelay);

      toast.success('Notification queued for delivery!');
      return data;
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTemplates = useCallback(async (associationId?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('notification_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (associationId) {
        query = query.eq('association_id', associationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTemplates(data || []);
      return data || [];
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to fetch notification templates');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_queue')
        .select(`
          *,
          notification_templates(name, type, category)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setQueue(data || []);
      return data || [];
    } catch (error: any) {
      console.error('Error fetching queue:', error);
      toast.error('Failed to fetch notification queue');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAutomatedWorkflow = useCallback(async (
    trigger: string,
    conditions: Record<string, any>,
    templateId: string,
    delayMinutes: number = 0
  ) => {
    // This would create an automated workflow
    // For demo purposes, we'll simulate this
    const workflow = {
      id: Math.random().toString(36).substring(7),
      trigger,
      conditions,
      templateId,
      delayMinutes,
      isActive: true
    };

    toast.success('Automated workflow created!');
    return workflow;
  }, []);

  return {
    isLoading,
    templates,
    queue,
    createTemplate,
    sendNotification,
    fetchTemplates,
    fetchQueue,
    createAutomatedWorkflow
  };
};

// AI-optimized timing calculation
function calculateOptimalSendTime(
  recipientType: string,
  category: string
): number {
  const now = new Date();
  const hour = now.getHours();

  // Emergency notifications - send immediately
  if (category === 'system_alert') {
    return 0;
  }

  // Payment reminders - send during business hours
  if (category === 'payment_reminder') {
    if (hour < 9 || hour > 17) {
      return (9 - hour) * 60 * 60 * 1000; // Wait until 9 AM
    }
    return 0;
  }

  // Announcements - send during peak engagement times
  if (category === 'announcement') {
    if (hour < 10) {
      return (10 - hour) * 60 * 60 * 1000; // Wait until 10 AM
    }
    if (hour > 20) {
      return (34 - hour) * 60 * 60 * 1000; // Wait until next day 10 AM
    }
    return 0;
  }

  // Default: send in 5 minutes
  return 5 * 60 * 1000;
}

// Process and send notification
async function processNotification(
  queueId: string,
  template: NotificationTemplate,
  variables: Record<string, any>
) {
  try {
    // Apply AI-driven message optimization
    const optimizedMessage = optimizeMessage(template.body_template, variables);
    
    // Simulate sending notification
    console.log('Sending optimized notification:', {
      type: template.type,
      subject: processTemplate(template.subject_template, variables),
      body: optimizedMessage
    });

    // Update queue status
    await supabase
      .from('notification_queue')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', queueId);

  } catch (error) {
    console.error('Error processing notification:', error);
    
    // Update queue with error
    await supabase
      .from('notification_queue')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', queueId);
  }
}

// AI message optimization
function optimizeMessage(template: string, variables: Record<string, any>): string {
  let message = processTemplate(template, variables);
  
  // AI optimizations:
  // 1. Personalization
  if (variables.firstName) {
    message = message.replace(/Hello,/g, `Hello ${variables.firstName},`);
  }
  
  // 2. Urgency indicators
  if (template.includes('urgent') || template.includes('deadline')) {
    message = `⚠️ URGENT: ${message}`;
  }
  
  // 3. Call-to-action optimization
  message = message.replace(/click here/gi, 'take action now');
  
  return message;
}

// Template variable processing
function processTemplate(template: string, variables: Record<string, any>): string {
  let processed = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    processed = processed.replace(new RegExp(placeholder, 'g'), String(value));
  });
  
  return processed;
}
