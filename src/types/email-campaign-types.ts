
export type EmailCampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
export type EmailTemplateCategory = 'welcome' | 'follow_up' | 'newsletter' | 'announcement' | 'promotional' | 'custom';
export type CampaignRecipientStatus = 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'failed';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: EmailCampaignStatus;
  template_id?: string;
  send_at?: string;
  completed_at?: string;
  created_by: string;
  target_audience: any;
  campaign_settings: any;
  delivery_count: number;
  recipient_count: number;
  open_count: number;
  click_count: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  unsubscribe_count: number;
  scheduled_date?: string;
  sent_date?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: EmailTemplateCategory;
  description?: string;
  preview_text?: string;
  merge_tags: string[];
  is_active: boolean;
  created_by?: string;
  version: number;
  parent_template_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignRecipient {
  id: string;
  campaign_id: string;
  lead_id?: string;
  email: string;
  status: CampaignRecipientStatus;
  delivery_attempts: number;
  last_delivery_attempt?: string;
  bounce_reason?: string;
  unsubscribe_reason?: string;
  metadata: any;
  sent_date?: string;
  opened_date?: string;
  clicked_date?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaignSegment {
  id: string;
  campaign_id: string;
  name: string;
  criteria: any;
  lead_count: number;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaignAnalytics {
  id: string;
  campaign_id: string;
  recipient_id: string;
  event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
  event_data: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface EmailAutomationWorkflow {
  id: string;
  name: string;
  description?: string;
  trigger_type: 'lead_created' | 'lead_status_change' | 'time_delay' | 'manual';
  trigger_criteria: any;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmailAutomationStep {
  id: string;
  workflow_id: string;
  step_order: number;
  step_type: 'send_email' | 'wait' | 'condition' | 'update_lead';
  template_id?: string;
  delay_amount?: number;
  conditions: any;
  actions: any;
  created_at: string;
}

export interface CampaignMetrics {
  total_recipients: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
}

export interface MergeTag {
  tag: string;
  label: string;
  category: 'lead' | 'company' | 'custom';
}
