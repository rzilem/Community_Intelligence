
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  scheduled_date?: string;
  sent_date?: string;
  recipient_count: number;
  open_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignRecipient {
  id: string;
  campaign_id: string;
  lead_id: string;
  email: string;
  status: 'pending' | 'sent' | 'opened' | 'clicked' | 'bounced';
  sent_date?: string;
  opened_date?: string;
  clicked_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignMetrics {
  total_recipients: number;
  sent_count: number;
  open_count: number;
  click_count: number;
  bounce_count: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
}
