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