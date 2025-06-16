
import { supabase } from '@/integrations/supabase/client';
import { VendorNotification, NotificationTemplate } from '@/types/vendor-advanced-types';

export const vendorNotificationService = {
  async getNotifications(associationId: string, filters?: {
    vendor_id?: string;
    status?: VendorNotification['status'];
    type?: VendorNotification['notification_type'];
  }): Promise<VendorNotification[]> {
    let query = supabase
      .from('vendor_notifications')
      .select('*')
      .eq('association_id', associationId);

    if (filters?.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.type) {
      query = query.eq('notification_type', filters.type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as VendorNotification[];
  },

  async createNotification(notification: Omit<VendorNotification, 'id' | 'created_at' | 'updated_at'>): Promise<VendorNotification> {
    const { data, error } = await supabase
      .from('vendor_notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data as VendorNotification;
  },

  async updateNotification(id: string, updates: Partial<Omit<VendorNotification, 'id' | 'created_at' | 'updated_at'>>): Promise<VendorNotification> {
    const { data, error } = await supabase
      .from('vendor_notifications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as VendorNotification;
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendor_notifications')
      .update({ 
        status: 'read' as const,
        read_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async sendBulkNotifications(notifications: Array<Omit<VendorNotification, 'id' | 'created_at' | 'updated_at'>>): Promise<VendorNotification[]> {
    const { data, error } = await supabase
      .from('vendor_notifications')
      .insert(notifications)
      .select();

    if (error) throw error;
    return (data || []) as VendorNotification[];
  },

  async getNotificationTemplates(): NotificationTemplate[] {
    return [
      {
        type: 'contract_expiry',
        title_template: 'Contract Expiring Soon - {{vendor_name}}',
        message_template: 'Your contract for {{service_type}} expires on {{expiry_date}}. Please review and renew if needed.',
        default_priority: 'high'
      },
      {
        type: 'compliance_due',
        title_template: 'Compliance Document Due - {{compliance_type}}',
        message_template: 'Your {{compliance_type}} documentation is due on {{due_date}}. Please submit required documents.',
        default_priority: 'high'
      },
      {
        type: 'payment_overdue',
        title_template: 'Payment Overdue - Invoice {{invoice_number}}',
        message_template: 'Payment for invoice {{invoice_number}} ({{amount}}) is overdue. Please process payment immediately.',
        default_priority: 'urgent'
      },
      {
        type: 'performance_alert',
        title_template: 'Performance Alert - {{vendor_name}}',
        message_template: 'Performance metrics for {{vendor_name}} require attention: {{performance_issue}}',
        default_priority: 'normal'
      },
      {
        type: 'bid_invitation',
        title_template: 'New Bid Opportunity - {{project_title}}',
        message_template: 'You are invited to bid on {{project_title}}. Deadline: {{bid_deadline}}',
        default_priority: 'normal'
      }
    ];
  },

  async createFromTemplate(
    template: NotificationTemplate, 
    variables: Record<string, string>, 
    notification: Omit<VendorNotification, 'id' | 'created_at' | 'updated_at' | 'title' | 'message' | 'priority' | 'notification_type'>
  ): Promise<VendorNotification> {
    const title = this.replaceVariables(template.title_template, variables);
    const message = this.replaceVariables(template.message_template, variables);

    return this.createNotification({
      ...notification,
      notification_type: template.type,
      title,
      message,
      priority: template.default_priority
    });
  },

  private replaceVariables(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match);
  }
};
