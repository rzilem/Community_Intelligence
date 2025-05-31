
export interface NotificationTemplate {
  id: string;
  association_id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  category: 'payment_reminder' | 'violation_notice' | 'announcement' | 'booking_confirmation' | 'system_alert';
  subject_template: string;
  body_template: string;
  variables: string[]; // Available template variables
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationQueue {
  id: string;
  template_id: string;
  recipient_type: 'resident' | 'property_manager' | 'board_member' | 'maintenance';
  recipient_id: string;
  recipient_email?: string;
  recipient_phone?: string;
  variables: Record<string, any>;
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  scheduled_at?: string;
  sent_at?: string;
  delivery_attempts: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationRule {
  id: string;
  association_id: string;
  name: string;
  trigger_event: string;
  conditions: Record<string, any>;
  template_id: string;
  delay_minutes?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
