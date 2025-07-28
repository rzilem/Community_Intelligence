-- Phase 3: Database Foundation for Enhanced Integration & Real-time Features

-- Integration Configuration Tables
CREATE TABLE IF NOT EXISTS integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('financial', 'communication', 'document', 'vendor', 'insurance', 'webhook')),
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'plaid', 'quickbooks', 'xero', 'twilio', 'sendgrid', 'microsoft_teams', 'slack', 'docusign', 'hellosign', 'angies_list', 'homeadvisor', 'custom_webhook')),
  name TEXT NOT NULL,
  description TEXT,
  configuration JSONB NOT NULL DEFAULT '{}',
  credentials JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_test_mode BOOLEAN NOT NULL DEFAULT false,
  webhook_url TEXT,
  rate_limit_per_minute INTEGER DEFAULT 60,
  retry_attempts INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  last_sync TIMESTAMPTZ,
  sync_status TEXT NOT NULL DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'success', 'error')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS integration_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integration_configs(id) ON DELETE CASCADE,
  is_healthy BOOLEAN NOT NULL DEFAULT true,
  last_check TIMESTAMPTZ NOT NULL DEFAULT now(),
  response_time_ms INTEGER,
  uptime_percentage NUMERIC(5,2) DEFAULT 100,
  error_rate_percentage NUMERIC(5,2) DEFAULT 0,
  recent_errors TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integration_configs(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('sync', 'webhook', 'api_call', 'test')),
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'timeout')),
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integration_configs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  headers JSONB NOT NULL DEFAULT '{}',
  processed BOOLEAN NOT NULL DEFAULT false,
  retry_count INTEGER NOT NULL DEFAULT 0,
  response_status INTEGER,
  response_body TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Real-time Processing Tables
CREATE TABLE IF NOT EXISTS realtime_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  association_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('global', 'association', 'board', 'maintenance', 'private')),
  participants TEXT[] DEFAULT '{}',
  permissions JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS realtime_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  association_id UUID NOT NULL,
  user_id UUID,
  data JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  channels TEXT[] NOT NULL DEFAULT '{}',
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS realtime_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  channel_id UUID NOT NULL REFERENCES realtime_channels(id) ON DELETE CASCADE,
  event_types TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS push_notification_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  association_id UUID NOT NULL,
  device_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('web', 'ios', 'android')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  preferences JSONB NOT NULL DEFAULT '{
    "maintenance_alerts": true,
    "payment_reminders": true,
    "board_announcements": true,
    "emergency_alerts": true,
    "vendor_updates": true
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Communication Enhancement Tables
CREATE TABLE IF NOT EXISTS communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'push', 'in_app', 'teams', 'slack')),
  name TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 1,
  rate_limit JSONB DEFAULT '{"max_per_hour": 100, "max_per_day": 1000}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS multi_channel_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  channels TEXT[] NOT NULL DEFAULT '{}',
  recipients JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'queued', 'sending', 'sent', 'failed')),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivery_stats JSONB NOT NULL DEFAULT '{
    "total_recipients": 0,
    "sent_count": 0,
    "delivered_count": 0,
    "opened_count": 0,
    "failed_count": 0
  }',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS smart_routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_conditions JSONB NOT NULL DEFAULT '[]',
  routing_actions JSONB NOT NULL DEFAULT '[]',
  priority INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS communication_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES communication_channels(id) ON DELETE CASCADE,
  period TEXT NOT NULL CHECK (period IN ('day', 'week', 'month')),
  metrics JSONB NOT NULL DEFAULT '{
    "total_sent": 0,
    "delivery_rate": 0,
    "open_rate": 0,
    "response_rate": 0,
    "average_response_time_hours": 0,
    "bounce_rate": 0,
    "engagement_score": 0
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Data Intelligence Tables
CREATE TABLE IF NOT EXISTS document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  name TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  patterns TEXT[] NOT NULL DEFAULT '{}',
  confidence_threshold NUMERIC(3,2) NOT NULL DEFAULT 0.7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_categorization_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  content_sample TEXT,
  predicted_category TEXT NOT NULL,
  confidence NUMERIC(3,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  asset_type TEXT NOT NULL,
  predicted_issue TEXT NOT NULL,
  probability NUMERIC(3,2) NOT NULL,
  predicted_date TIMESTAMPTZ NOT NULL,
  recommended_action TEXT NOT NULL,
  cost_estimate NUMERIC(10,2),
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS financial_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  period TEXT NOT NULL,
  forecasted_revenue NUMERIC(12,2) NOT NULL,
  forecasted_expenses NUMERIC(12,2) NOT NULL,
  predicted_cash_flow NUMERIC(12,2) NOT NULL,
  confidence_level NUMERIC(3,2) NOT NULL,
  factors JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  regulation_type TEXT NOT NULL,
  requirement TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'overdue', 'completed')),
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  recommended_actions TEXT[] NOT NULL DEFAULT '{}',
  responsible_party TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_executed TIMESTAMPTZ,
  execution_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_integration_configs_association ON integration_configs(association_id);
CREATE INDEX IF NOT EXISTS idx_integration_configs_type ON integration_configs(type);
CREATE INDEX IF NOT EXISTS idx_integration_health_integration ON integration_health(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_integration ON integration_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_integration ON webhook_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_realtime_channels_association ON realtime_channels(association_id);
CREATE INDEX IF NOT EXISTS idx_realtime_events_association ON realtime_events(association_id);
CREATE INDEX IF NOT EXISTS idx_realtime_events_type ON realtime_events(type);
CREATE INDEX IF NOT EXISTS idx_realtime_subscriptions_user ON realtime_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_notification_configs_user ON push_notification_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_channels_association ON communication_channels(association_id);
CREATE INDEX IF NOT EXISTS idx_multi_channel_messages_association ON multi_channel_messages(association_id);
CREATE INDEX IF NOT EXISTS idx_smart_routing_rules_association ON smart_routing_rules(association_id);
CREATE INDEX IF NOT EXISTS idx_document_categories_association ON document_categories(association_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_predictions_association ON maintenance_predictions(association_id);
CREATE INDEX IF NOT EXISTS idx_financial_forecasts_association ON financial_forecasts(association_id);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_association ON compliance_alerts(association_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_association ON automation_rules(association_id);

-- Triggers for updated_at
CREATE TRIGGER update_integration_configs_updated_at
  BEFORE UPDATE ON integration_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_health_updated_at
  BEFORE UPDATE ON integration_health
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_notification_configs_updated_at
  BEFORE UPDATE ON push_notification_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_multi_channel_messages_updated_at
  BEFORE UPDATE ON multi_channel_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smart_routing_rules_updated_at
  BEFORE UPDATE ON smart_routing_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notification_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE multi_channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categorization_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies for association-based access
CREATE POLICY "Users can access integration configs for their associations" ON integration_configs
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access integration health for their associations" ON integration_health
  FOR ALL USING (
    integration_id IN (
      SELECT id FROM integration_configs WHERE check_user_association(association_id)
    )
  );

CREATE POLICY "Users can access integration logs for their associations" ON integration_logs
  FOR ALL USING (
    integration_id IN (
      SELECT id FROM integration_configs WHERE check_user_association(association_id)
    )
  );

CREATE POLICY "Users can access webhook events for their associations" ON webhook_events
  FOR ALL USING (
    integration_id IN (
      SELECT id FROM integration_configs WHERE check_user_association(association_id)
    )
  );

CREATE POLICY "Users can access realtime channels for their associations" ON realtime_channels
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access realtime events for their associations" ON realtime_events
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can manage their own realtime subscriptions" ON realtime_subscriptions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own push notification configs" ON push_notification_configs
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access communication channels for their associations" ON communication_channels
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access multi-channel messages for their associations" ON multi_channel_messages
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access smart routing rules for their associations" ON smart_routing_rules
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access communication analytics for their associations" ON communication_analytics
  FOR ALL USING (
    channel_id IN (
      SELECT id FROM communication_channels WHERE check_user_association(association_id)
    )
  );

CREATE POLICY "Users can access document categories for their associations" ON document_categories
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access document categorization log for their associations" ON document_categorization_log
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access maintenance predictions for their associations" ON maintenance_predictions
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access financial forecasts for their associations" ON financial_forecasts
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access compliance alerts for their associations" ON compliance_alerts
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access automation rules for their associations" ON automation_rules
  FOR ALL USING (check_user_association(association_id));