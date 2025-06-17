
-- Milestone 1: Database Foundation & Core Infrastructure
-- Enhance email campaigns database schema

-- Create email campaign statuses enum
CREATE TYPE email_campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled');

-- Create email template categories enum  
CREATE TYPE email_template_category AS ENUM ('welcome', 'follow_up', 'newsletter', 'announcement', 'promotional', 'custom');

-- Create campaign recipient statuses enum
CREATE TYPE campaign_recipient_status AS ENUM ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'failed');

-- Enhance email_campaigns table
ALTER TABLE email_campaigns 
  DROP COLUMN IF EXISTS status,
  ADD COLUMN status email_campaign_status DEFAULT 'draft',
  ADD COLUMN template_id UUID REFERENCES email_templates(id),
  ADD COLUMN send_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN created_by UUID REFERENCES auth.users(id),
  ADD COLUMN target_audience JSONB DEFAULT '{}',
  ADD COLUMN campaign_settings JSONB DEFAULT '{}',
  ADD COLUMN delivery_count INTEGER DEFAULT 0,
  ADD COLUMN open_rate DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN click_rate DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN bounce_rate DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN unsubscribe_count INTEGER DEFAULT 0;

-- Enhance email_templates table
ALTER TABLE email_templates 
  ADD COLUMN category email_template_category DEFAULT 'custom',
  ADD COLUMN description TEXT,
  ADD COLUMN preview_text TEXT,
  ADD COLUMN merge_tags JSONB DEFAULT '[]',
  ADD COLUMN is_active BOOLEAN DEFAULT true,
  ADD COLUMN created_by UUID REFERENCES auth.users(id),
  ADD COLUMN version INTEGER DEFAULT 1,
  ADD COLUMN parent_template_id UUID REFERENCES email_templates(id);

-- Enhance campaign_recipients table
ALTER TABLE campaign_recipients 
  DROP COLUMN IF EXISTS status,
  ADD COLUMN status campaign_recipient_status DEFAULT 'pending',
  ADD COLUMN delivery_attempts INTEGER DEFAULT 0,
  ADD COLUMN last_delivery_attempt TIMESTAMP WITH TIME ZONE,
  ADD COLUMN bounce_reason TEXT,
  ADD COLUMN unsubscribe_reason TEXT,
  ADD COLUMN metadata JSONB DEFAULT '{}';

-- Create email_campaign_segments table for advanced targeting
CREATE TABLE email_campaign_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}',
  lead_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create email_campaign_analytics table for detailed tracking
CREATE TABLE email_campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES campaign_recipients(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed'
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create email_automation_workflows table for drip campaigns
CREATE TABLE email_automation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- 'lead_created', 'lead_status_change', 'time_delay', 'manual'
  trigger_criteria JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create email_automation_steps table for workflow steps
CREATE TABLE email_automation_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES email_automation_workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_type TEXT NOT NULL, -- 'send_email', 'wait', 'condition', 'update_lead'
  template_id UUID REFERENCES email_templates(id),
  delay_amount INTEGER, -- in hours
  conditions JSONB DEFAULT '{}',
  actions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_created_by ON email_campaigns(created_by);
CREATE INDEX idx_email_campaigns_send_at ON email_campaigns(send_at);
CREATE INDEX idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_status ON campaign_recipients(status);
CREATE INDEX idx_email_campaign_analytics_campaign_id ON email_campaign_analytics(campaign_id);
CREATE INDEX idx_email_campaign_analytics_event_type ON email_campaign_analytics(event_type);
CREATE INDEX idx_email_campaign_analytics_created_at ON email_campaign_analytics(created_at);
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_templates_is_active ON email_templates(is_active);

-- Add RLS policies for email_campaigns
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view email campaigns" ON email_campaigns
  FOR SELECT USING (true); -- For now, allow all authenticated users

CREATE POLICY "Users can create email campaigns" ON email_campaigns
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their email campaigns" ON email_campaigns
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their email campaigns" ON email_campaigns
  FOR DELETE USING (auth.uid() = created_by);

-- Add RLS policies for email_templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active email templates" ON email_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create email templates" ON email_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their email templates" ON email_templates
  FOR UPDATE USING (auth.uid() = created_by);

-- Add RLS policies for campaign_recipients
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view campaign recipients" ON campaign_recipients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM email_campaigns 
      WHERE email_campaigns.id = campaign_recipients.campaign_id 
      AND email_campaigns.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert campaign recipients" ON campaign_recipients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM email_campaigns 
      WHERE email_campaigns.id = campaign_recipients.campaign_id 
      AND email_campaigns.created_by = auth.uid()
    )
  );

-- Add RLS policies for new tables
ALTER TABLE email_campaign_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_automation_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage campaign segments" ON email_campaign_segments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM email_campaigns 
      WHERE email_campaigns.id = email_campaign_segments.campaign_id 
      AND email_campaigns.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view campaign analytics" ON email_campaign_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM email_campaigns 
      WHERE email_campaigns.id = email_campaign_analytics.campaign_id 
      AND email_campaigns.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage automation workflows" ON email_automation_workflows
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users can manage automation steps" ON email_automation_steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM email_automation_workflows 
      WHERE email_automation_workflows.id = email_automation_steps.workflow_id 
      AND email_automation_workflows.created_by = auth.uid()
    )
  );

-- Create function to calculate campaign metrics
CREATE OR REPLACE FUNCTION calculate_campaign_metrics(campaign_uuid UUID)
RETURNS TABLE (
  total_recipients INTEGER,
  delivered_count INTEGER,
  opened_count INTEGER,
  clicked_count INTEGER,
  bounced_count INTEGER,
  unsubscribed_count INTEGER,
  open_rate DECIMAL,
  click_rate DECIMAL,
  bounce_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_recipients,
    COUNT(CASE WHEN cr.status IN ('delivered', 'opened', 'clicked') THEN 1 END)::INTEGER as delivered_count,
    COUNT(CASE WHEN cr.status IN ('opened', 'clicked') THEN 1 END)::INTEGER as opened_count,
    COUNT(CASE WHEN cr.status = 'clicked' THEN 1 END)::INTEGER as clicked_count,
    COUNT(CASE WHEN cr.status = 'bounced' THEN 1 END)::INTEGER as bounced_count,
    COUNT(CASE WHEN cr.status = 'unsubscribed' THEN 1 END)::INTEGER as unsubscribed_count,
    CASE 
      WHEN COUNT(CASE WHEN cr.status IN ('delivered', 'opened', 'clicked') THEN 1 END) > 0 
      THEN (COUNT(CASE WHEN cr.status IN ('opened', 'clicked') THEN 1 END)::DECIMAL / COUNT(CASE WHEN cr.status IN ('delivered', 'opened', 'clicked') THEN 1 END)::DECIMAL) * 100
      ELSE 0
    END as open_rate,
    CASE 
      WHEN COUNT(CASE WHEN cr.status IN ('delivered', 'opened', 'clicked') THEN 1 END) > 0 
      THEN (COUNT(CASE WHEN cr.status = 'clicked' THEN 1 END)::DECIMAL / COUNT(CASE WHEN cr.status IN ('delivered', 'opened', 'clicked') THEN 1 END)::DECIMAL) * 100
      ELSE 0
    END as click_rate,
    CASE 
      WHEN COUNT(*) > 0 
      THEN (COUNT(CASE WHEN cr.status = 'bounced' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100
      ELSE 0
    END as bounce_rate
  FROM campaign_recipients cr
  WHERE cr.campaign_id = campaign_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update campaign metrics
CREATE OR REPLACE FUNCTION update_campaign_metrics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE email_campaigns 
  SET 
    delivery_count = (SELECT delivered_count FROM calculate_campaign_metrics(NEW.campaign_id)),
    open_rate = (SELECT open_rate FROM calculate_campaign_metrics(NEW.campaign_id)),
    click_rate = (SELECT click_rate FROM calculate_campaign_metrics(NEW.campaign_id)),
    bounce_rate = (SELECT bounce_rate FROM calculate_campaign_metrics(NEW.campaign_id)),
    updated_at = now()
  WHERE id = NEW.campaign_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update campaign metrics
CREATE TRIGGER update_campaign_metrics_trigger
  AFTER INSERT OR UPDATE OF status ON campaign_recipients
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_metrics();

-- Add updated_at triggers for new tables
CREATE TRIGGER update_email_campaign_segments_updated_at
  BEFORE UPDATE ON email_campaign_segments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_automation_workflows_updated_at
  BEFORE UPDATE ON email_automation_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
