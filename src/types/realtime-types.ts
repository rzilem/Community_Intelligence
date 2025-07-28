// Real-time Processing & Communication Types for Phase 3

export type RealtimeEventType = 
  | 'maintenance_request_created'
  | 'maintenance_request_updated'
  | 'payment_received'
  | 'document_uploaded'
  | 'message_received'
  | 'violation_created'
  | 'board_meeting_scheduled'
  | 'announcement_published'
  | 'emergency_alert'
  | 'vendor_bid_submitted'
  | 'compliance_due_soon'
  | 'user_online'
  | 'user_offline'
  | 'typing_indicator';

export interface RealtimeEvent {
  id: string;
  type: RealtimeEventType;
  association_id: string;
  user_id?: string;
  data: Record<string, any>;
  timestamp: string;
  channels: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expires_at?: string;
}

export interface RealtimeChannel {
  id: string;
  name: string;
  association_id: string;
  type: 'global' | 'association' | 'board' | 'maintenance' | 'private';
  participants: string[];
  permissions: Record<string, string[]>;
  is_active: boolean;
  created_at: string;
}

export interface RealtimeSubscription {
  id: string;
  user_id: string;
  channel_id: string;
  event_types: RealtimeEventType[];
  is_active: boolean;
  last_seen?: string;
  created_at: string;
}

export interface PushNotificationConfig {
  id: string;
  user_id: string;
  association_id: string;
  device_token: string;
  platform: 'web' | 'ios' | 'android';
  is_active: boolean;
  preferences: {
    maintenance_alerts: boolean;
    payment_reminders: boolean;
    board_announcements: boolean;
    emergency_alerts: boolean;
    vendor_updates: boolean;
    quiet_hours_start?: string;
    quiet_hours_end?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CommunicationChannel {
  id: string;
  type: 'email' | 'sms' | 'push' | 'in_app' | 'teams' | 'slack';
  name: string;
  configuration: Record<string, any>;
  is_active: boolean;
  priority: number;
  rate_limit?: {
    max_per_hour: number;
    max_per_day: number;
  };
  created_at: string;
}

export interface MultiChannelMessage {
  id: string;
  association_id: string;
  sender_id: string;
  subject: string;
  content: string;
  channels: string[];
  recipients: Array<{
    user_id: string;
    preferred_channel?: string;
  }>;
  status: 'draft' | 'queued' | 'sending' | 'sent' | 'failed';
  scheduled_for?: string;
  sent_at?: string;
  delivery_stats: {
    total_recipients: number;
    sent_count: number;
    delivered_count: number;
    opened_count: number;
    failed_count: number;
  };
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SmartRoutingRule {
  id: string;
  association_id: string;
  name: string;
  description?: string;
  trigger_conditions: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  }>;
  routing_actions: Array<{
    type: 'assign_to_user' | 'assign_to_role' | 'escalate' | 'auto_respond' | 'create_task';
    config: Record<string, any>;
  }>;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunicationAnalytics {
  channel_id: string;
  period: 'day' | 'week' | 'month';
  metrics: {
    total_sent: number;
    delivery_rate: number;
    open_rate: number;
    response_rate: number;
    average_response_time_hours: number;
    bounce_rate: number;
    engagement_score: number;
  };
  created_at: string;
}

export interface LiveCollaboration {
  id: string;
  document_id: string;
  association_id: string;
  type: 'meeting_minutes' | 'board_document' | 'policy_review';
  active_users: Array<{
    user_id: string;
    cursor_position?: number;
    selection_start?: number;
    selection_end?: number;
    last_activity: string;
  }>;
  changes: Array<{
    user_id: string;
    timestamp: string;
    operation: 'insert' | 'delete' | 'format';
    position: number;
    content?: string;
    length?: number;
  }>;
  is_locked: boolean;
  locked_by?: string;
  created_at: string;
  updated_at: string;
}