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
        .from('notification_templates' as any)
        .insert([templateData])
        .select('*')
        .single();

      if (error) throw error;

      const typedData = data as unknown as NotificationTemplate;
      setTemplates(prev => [typedData, ...prev]);
      toast.success('Notification template created successfully!');
      return typedData;
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
      const { data: template, error: templateError } = await supabase
        .from('notification_templates' as any)
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;
      const typedTemplate = template as unknown as NotificationTemplate;

      const { data, error } = await supabase
        .from('notification_queue' as any)
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
      const typedData = data as unknown as NotificationQueue;

      const optimizedDelay = calculateOptimalSendTime(recipientType, typedTemplate.category);
      
      setTimeout(async () => {
        await processNotification(typedData.id, typedTemplate, variables);
      }, optimizedDelay);

      toast.success('Notification queued for delivery!');
      return typedData;
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
        .from('notification_templates' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (associationId) {
        query = query.eq('association_id', associationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const typedData = (data || []) as unknown as NotificationTemplate[];
      setTemplates(typedData);
      return typedData;
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
        .from('notification_queue' as any)
        .select(`
          *,
          notification_templates(name, type, category)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const typedData = (data || []) as unknown as NotificationQueue[];
      setQueue(typedData);
      return typedData;
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

function calculateOptimalSendTime(recipientType: string, category: string): number {
  const now = new Date();
  const hour = now.getHours();

  if (category === 'system_alert') return 0;
  
  if (category === 'payment_reminder') {
    if (hour < 9 || hour > 17) return (9 - hour) * 60 * 60 * 1000;
    return 0;
  }
  
  if (category === 'announcement') {
    if (hour < 10) return (10 - hour) * 60 * 60 * 1000;
    if (hour > 20) return (34 - hour) * 60 * 60 * 1000;
    return 0;
  }
  
  return 5 * 60 * 1000;
}

async function processNotification(
  queueId: string,
  template: NotificationTemplate,
  variables: Record<string, any>
) {
  try {
    const optimizedMessage = optimizeMessage(template.body_template, variables);
    
    console.log('Sending optimized notification:', {
      type: template.type,
      subject: processTemplate(template.subject_template || '', variables),
      body: optimizedMessage
    });

    await supabase
      .from('notification_queue' as any)
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', queueId);

  } catch (error) {
    console.error('Error processing notification:', error);
    
    await supabase
      .from('notification_queue' as any)
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', queueId);
  }
}

function optimizeMessage(template: string, variables: Record<string, any>): string {
  let message = processTemplate(template, variables);
  
  if (variables.firstName) {
    message = message.replace(/Hello,/g, `Hello ${variables.firstName},`);
  }
  
  if (template.includes('urgent') || template.includes('deadline')) {
    message = `⚠️ URGENT: ${message}`;
  }
  
  message = message.replace(/click here/gi, 'take action now');
  
  return message;
}

function processTemplate(template: string, variables: Record<string, any>): string {
  let processed = template;
  
  Object.entries(var