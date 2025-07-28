-- Phase 5: IoT Integration Platform Tables

-- IoT Devices table
CREATE TABLE public.iot_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL,
  device_model TEXT,
  manufacturer TEXT,
  serial_number TEXT,
  mac_address TEXT,
  ip_address TEXT,
  location TEXT,
  property_id UUID,
  status TEXT NOT NULL DEFAULT 'active',
  firmware_version TEXT,
  last_seen TIMESTAMP WITH TIME ZONE,
  battery_level INTEGER,
  signal_strength INTEGER,
  configuration JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- IoT Sensor Data table
CREATE TABLE public.iot_sensor_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL,
  sensor_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- IoT Alerts table
CREATE TABLE public.iot_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL,
  association_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  threshold_value NUMERIC,
  current_value NUMERIC,
  status TEXT NOT NULL DEFAULT 'active',
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- IoT Automations table
CREATE TABLE public.iot_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- IoT Device Commands table
CREATE TABLE public.iot_device_commands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL,
  command_type TEXT NOT NULL,
  command_data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  response_data JSONB,
  sent_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Phase 7: Advanced Financial Management Tables

-- Budget Scenarios table
CREATE TABLE public.budget_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_budget_id UUID,
  scenario_type TEXT NOT NULL DEFAULT 'what_if',
  assumptions JSONB DEFAULT '{}',
  adjustments JSONB DEFAULT '{}',
  results JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Financial KPIs table
CREATE TABLE public.financial_kpis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  kpi_name TEXT NOT NULL,
  kpi_type TEXT NOT NULL,
  current_value NUMERIC,
  target_value NUMERIC,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  calculation_method TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cash Flow Forecasts table
CREATE TABLE public.cash_flow_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  forecast_date DATE NOT NULL,
  forecast_type TEXT NOT NULL DEFAULT 'monthly',
  opening_balance NUMERIC NOT NULL DEFAULT 0,
  projected_income NUMERIC NOT NULL DEFAULT 0,
  projected_expenses NUMERIC NOT NULL DEFAULT 0,
  closing_balance NUMERIC NOT NULL DEFAULT 0,
  confidence_level NUMERIC,
  assumptions JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Financial Benchmarks table
CREATE TABLE public.financial_benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  benchmark_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  association_value NUMERIC,
  benchmark_value NUMERIC,
  variance_percentage NUMERIC,
  peer_group TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Automated Journal Entries table
CREATE TABLE public.automated_journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL,
  next_run_date DATE,
  last_run_date DATE,
  journal_entry_template JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Phase 6: PWA Enhancement Tables

-- PWA Configurations table
CREATE TABLE public.pwa_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  app_name TEXT NOT NULL,
  app_description TEXT,
  theme_color TEXT DEFAULT '#1f2937',
  background_color TEXT DEFAULT '#ffffff',
  app_icon_url TEXT,
  splash_screen_url TEXT,
  features_enabled JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  offline_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Push Notification Subscriptions table
CREATE TABLE public.push_notification_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  association_id UUID NOT NULL,
  subscription_data JSONB NOT NULL,
  device_type TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mobile App Analytics table
CREATE TABLE public.mobile_app_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  association_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  device_info JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_device_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pwa_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_app_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for IoT tables
CREATE POLICY "Users can access IoT devices for their associations" 
ON public.iot_devices FOR ALL 
USING (check_user_association(association_id));

CREATE POLICY "Users can access IoT sensor data for their associations" 
ON public.iot_sensor_data FOR ALL 
USING (device_id IN (
  SELECT id FROM public.iot_devices WHERE check_user_association(association_id)
));

CREATE POLICY "Users can access IoT alerts for their associations" 
ON public.iot_alerts FOR ALL 
USING (check_user_association(association_id));

CREATE POLICY "Users can access IoT automations for their associations" 
ON public.iot_automations FOR ALL 
USING (check_user_association(association_id));

CREATE POLICY "Users can access IoT device commands for their associations" 
ON public.iot_device_commands FOR ALL 
USING (device_id IN (
  SELECT id FROM public.iot_devices WHERE check_user_association(association_id)
));

-- Create RLS policies for Financial tables
CREATE POLICY "Users can access budget scenarios for their associations" 
ON public.budget_scenarios FOR ALL 
USING (check_user_association(association_id));

CREATE POLICY "Users can access financial KPIs for their associations" 
ON public.financial_kpis FOR ALL 
USING (check_user_association(association_id));

CREATE POLICY "Users can access cash flow forecasts for their associations" 
ON public.cash_flow_forecasts FOR ALL 
USING (check_user_association(association_id));

CREATE POLICY "Users can access financial benchmarks for their associations" 
ON public.financial_benchmarks FOR ALL 
USING (check_user_association(association_id));

CREATE POLICY "Users can access automated journal entries for their associations" 
ON public.automated_journal_entries FOR ALL 
USING (check_user_association(association_id));

-- Create RLS policies for PWA tables
CREATE POLICY "Users can access PWA configurations for their associations" 
ON public.pwa_configurations FOR ALL 
USING (check_user_association(association_id));

CREATE POLICY "Users can access their own push notification subscriptions" 
ON public.push_notification_subscriptions FOR ALL 
USING ((user_id = auth.uid()) AND check_user_association(association_id));

CREATE POLICY "Users can access mobile app analytics for their associations" 
ON public.mobile_app_analytics FOR ALL 
USING (check_user_association(association_id));

-- Create indexes for performance
CREATE INDEX idx_iot_devices_association_id ON public.iot_devices(association_id);
CREATE INDEX idx_iot_sensor_data_device_id ON public.iot_sensor_data(device_id);
CREATE INDEX idx_iot_sensor_data_timestamp ON public.iot_sensor_data(timestamp);
CREATE INDEX idx_iot_alerts_association_id ON public.iot_alerts(association_id);
CREATE INDEX idx_iot_alerts_status ON public.iot_alerts(status);
CREATE INDEX idx_financial_kpis_association_id ON public.financial_kpis(association_id);
CREATE INDEX idx_cash_flow_forecasts_association_id ON public.cash_flow_forecasts(association_id);
CREATE INDEX idx_cash_flow_forecasts_date ON public.cash_flow_forecasts(forecast_date);
CREATE INDEX idx_push_subscriptions_user_id ON public.push_notification_subscriptions(user_id);
CREATE INDEX idx_mobile_analytics_association_id ON public.mobile_app_analytics(association_id);

-- Create update triggers
CREATE TRIGGER update_iot_devices_updated_at
  BEFORE UPDATE ON public.iot_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_iot_alerts_updated_at
  BEFORE UPDATE ON public.iot_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_iot_automations_updated_at
  BEFORE UPDATE ON public.iot_automations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_budget_scenarios_updated_at
  BEFORE UPDATE ON public.budget_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_financial_kpis_updated_at
  BEFORE UPDATE ON public.financial_kpis
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_cash_flow_forecasts_updated_at
  BEFORE UPDATE ON public.cash_flow_forecasts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_automated_journal_entries_updated_at
  BEFORE UPDATE ON public.automated_journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_pwa_configurations_updated_at
  BEFORE UPDATE ON public.pwa_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_push_notification_subscriptions_updated_at
  BEFORE UPDATE ON public.push_notification_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();