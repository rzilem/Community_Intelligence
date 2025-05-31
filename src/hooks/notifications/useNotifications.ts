
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { NotificationTemplate, NotificationQueue } from '@/types/notification-types';

// Mock data for demonstration
const mockTemplates: NotificationTemplate[] = [
  {
    id: 'template-1',
    association_id: 'demo-association',
    name: 'Payment Reminder',
    type: 'email',
    category: 'payment_reminder',
    subject_template: 'Payment Due: {{amount}} for {{property_address}}',
    body_template: 'Dear {{firstName}}, your payment of {{amount}} is due on {{dueDate}}.',
    variables: ['firstName', 'amount', 'property_address', 'dueDate'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'template-2',
    association_id: 'demo-association',
    name: 'Welcome Message',
    type: 'email',
    category: 'announcement',
    subject_template: 'Welcome to {{association_name}}',
    body_template: 'Welcome {{firstName}}, we\'re excited to have you in our community!',
    variables: ['firstName', 'association_name'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockQueue: NotificationQueue[] = [
  {
    id: 'queue-1',
    template_id: 'template-1',
    recipient_type: 'resident',
    recipient_id: 'resident-1',
    recipient_email: 'resident@example.com',
    variables: { firstName: 'John', amount: '$250.00', dueDate: '2024-02-15' },
    status: 'sent',
    sent_at: new Date().toISOString(),
    delivery_attempts: 1,
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
      const newTemplate: NotificationTemplate = {
        id: Date.now().toString(),
        association_id: templateData.association_id || 'demo-association',
        name: templateData.name || '',
        type: templateData.type || 'email',
        category: templateData.category || 'announcement',
        subject_template: templateData.subject_template || '',
        body_template: templateData.body_template || '',
        variables: templateData.variables || [],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const newQueueItem: NotificationQueue = {
        id: Date.now().toString(),
        template_id: templateId,
        recipient_type: recipientType,
        recipient_id: recipientId,
        variables,
        status: 'sent',
        sent_at: new Date().toISOString(),
        delivery_attempts: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setQueue(prev => [newQueueItem, ...prev]);

      // Simulate AI-optimized timing
      const optimizedDelay = calculateOptimalSendTime(recipientType, template.category);
      
      setTimeout(() => {
        console.log('Notification sent with AI optimization:', {
          template: template.name,
          recipient: recipientId,
          delay: optimizedDelay
        });
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
