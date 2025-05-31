import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// Mock types for notifications (no database dependency)
export interface NotificationTemplate {
  id: string;
  association_id: string | null;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  category: 'payment_reminder' | 'announcement' | 'system_alert' | 'maintenance' | 'event' | 'violation';
  subject_template: string | null;
  body_template: string;
  variables: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface NotificationQueue {
  id: string;
  template_id: string;
  recipient_type: 'resident' | 'property_manager' | 'board_member' | 'maintenance';
  recipient_id: string;
  variables: Record<string, any>;
  status: 'queued' | 'sent' | 'failed' | 'cancelled';
  scheduled_at: string;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// Mock data
const mockTemplates: NotificationTemplate[] = [
  {
    id: '1',
    association_id: 'demo-association',
    name: 'Payment Reminder',
    type: 'email',
    category: 'payment_reminder',
    subject_template: 'Payment Reminder: {{amount}} Due',
    body_template: 'Hello {{firstName}}, your payment of {{amount}} is due on {{dueDate}}.',
    variables: { amount: 0, firstName: '', dueDate: '' },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'admin'
  },
  {
    id: '2',
    association_id: 'demo-association',
    name: 'Maintenance Alert',
    type: 'in_app',
    category: 'maintenance',
    subject_template: 'Maintenance Scheduled',
    body_template: 'Maintenance is scheduled for {{location}} on {{date}}.',
    variables: { location: '', date: '' },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'admin'
  }
];

const mockQueue: NotificationQueue[] = [
  {
    id: '1',
    template_id: '1',
    recipient_type: 'resident',
    recipient_id: 'user-123',
    variables: { amount: '$250.00', firstName: 'John', dueDate: '2024-02-15' },
    status: 'queued',
    scheduled_at: new Date().toISOString(),
    sent_at: null,
    error_message: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<NotificationTemplate[]>(mockTemplates);
  const [queue, setQueue] = useState<NotificationQueue[]>(mockQueue);

  const createTemplate = useCallback(async (templateData: Partial<NotificationTemplate>) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newTemplate: NotificationTemplate = {
        id: Math.random().toString(36).substring(7),
        association_id: templateData.association_id || 'demo-association',
        name: templateData.name || 'New Template',
        type: templateData.type || 'email',
        category: templateData.category || 'announcement',
        subject_template: templateData.subject_template || 'Subject',
        body_template: templateData.body_template || 'Body content',
        variables: templateData.variables || {},
        is_active: templateData.is_active !== undefined ? templateData.is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: templateData.created_by || 'current-user'
      };

      setTemplates(prev => [newTemplate, ...prev]);
      toast.success('Notification template created successfully!');
      return newTemplate;
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const newQueueItem: NotificationQueue = {
        id: Math.random().toString(36).substring(7),
        template_id: templateId,
        recipient_type: recipientType,
        recipient_id: recipientId,
        variables,
        status: 'queued',
        scheduled_at: new Date().toISOString(),
        sent_at: null,
        error_message: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setQueue(prev => [newQueueItem, ...prev]);

      const optimizedDelay = calculateOptimalSendTime(recipientType, template.category);
      
      // Process notification with AI optimization
      setTimeout(async () => {
        await processNotification(newQueueItem.id, template, variables);
      }, optimizedDelay);

      toast.success('Notification queued for delivery!');
      return newQueueItem;
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [templates]);

  const fetchTemplates = useCallback(async (associationId?: string) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      let filteredTemplates = mockTemplates;
      if (associationId) {
        filteredTemplates = mockTemplates.filter(t => t.association_id === associationId);
      }

      setTemplates(filteredTemplates);
      return filteredTemplates;
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      setQueue(mockQueue);
      return mockQueue;
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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

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
function calculateOptimalSendTime(recipientType: string, category: string): number {
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
      subject: processTemplate(template.subject_template || '', variables),
      body: optimizedMessage
    });

    // Simulate successful delivery
    console.log(`Notification ${queueId} sent successfully`);

  } catch (error) {
    console.error('Error processing notification:', error);
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