-- Phase 10: AI/ML Platform Completion & Workflow Automation

-- Create ML training pipeline tables
CREATE TABLE IF NOT EXISTS public.ml_training_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID REFERENCES public.associations(id),
  pipeline_name TEXT NOT NULL,
  model_type TEXT NOT NULL, -- 'financial_forecast', 'maintenance_prediction', 'sentiment_analysis', etc.
  training_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'training', 'completed', 'failed'
  dataset_size INTEGER DEFAULT 0,
  accuracy_score NUMERIC(5,4) DEFAULT 0,
  hyperparameters JSONB DEFAULT '{}',
  training_metrics JSONB DEFAULT '{}',
  model_version TEXT,
  deployed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document processing queue table (correcting the smart document processor)
CREATE TABLE IF NOT EXISTS public.document_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  processing_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  ai_classification JSONB DEFAULT '{}',
  confidence_score NUMERIC(3,2) DEFAULT 0,
  extracted_data JSONB DEFAULT '{}',
  processing_results JSONB DEFAULT '{}',
  workflow_triggers JSONB DEFAULT '[]',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow executions table (correcting the intelligent workflow engine)  
CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_template_id UUID NOT NULL,
  association_id UUID REFERENCES public.associations(id),
  status TEXT NOT NULL DEFAULT 'pending',
  execution_data JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  ai_insights JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communication intelligence table (correcting the communication hub)
CREATE TABLE IF NOT EXISTS public.communication_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  communication_id UUID,
  association_id UUID REFERENCES public.associations(id),
  message_content TEXT NOT NULL,
  ai_category TEXT,
  sentiment_score NUMERIC(3,2) DEFAULT 0,
  urgency_level TEXT NOT NULL DEFAULT 'normal',
  suggested_responses JSONB DEFAULT '[]',
  auto_routing_rules JSONB DEFAULT '{}',
  confidence_metrics JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create real-time analytics tables
CREATE TABLE IF NOT EXISTS public.analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID REFERENCES public.associations(id),
  dashboard_name TEXT NOT NULL,
  dashboard_config JSONB NOT NULL DEFAULT '{}',
  widgets JSONB DEFAULT '[]',
  refresh_interval INTEGER DEFAULT 300, -- seconds
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID REFERENCES public.associations(id),
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL, -- 'financial', 'operational', 'resident', 'maintenance'
  metric_value NUMERIC,
  dimensions JSONB DEFAULT '{}',
  aggregation_period TEXT DEFAULT 'daily', -- 'hourly', 'daily', 'weekly', 'monthly'
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create IoT integration tables
CREATE TABLE IF NOT EXISTS public.iot_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID REFERENCES public.associations(id),
  property_id UUID,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL, -- 'sensor', 'camera', 'lock', 'thermostat', etc.
  device_id TEXT UNIQUE NOT NULL,
  manufacturer TEXT,
  model TEXT,
  firmware_version TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'maintenance', 'error'
  location_description TEXT,
  configuration JSONB DEFAULT '{}',
  last_seen TIMESTAMP WITH TIME ZONE,
  installed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.iot_sensor_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.iot_devices(id),
  sensor_type TEXT NOT NULL, -- 'temperature', 'humidity', 'motion', 'water_leak', etc.
  value NUMERIC NOT NULL,
  unit TEXT, -- 'celsius', 'fahrenheit', 'percent', 'boolean', etc.
  quality_score NUMERIC(3,2) DEFAULT 1.0,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create advanced workflow automation tables
CREATE TABLE IF NOT EXISTS public.workflow_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID REFERENCES public.associations(id),
  workflow_template_id UUID,
  schedule_name TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  next_run TIMESTAMP WITH TIME ZONE,
  last_run TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,
  parameters JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workflow_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_execution_id UUID REFERENCES public.workflow_executions(id),
  association_id UUID REFERENCES public.associations(id),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_type TEXT NOT NULL, -- 'duration', 'success_rate', 'cost', 'efficiency'
  measurement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mobile app configuration
CREATE TABLE IF NOT EXISTS public.mobile_app_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID REFERENCES public.associations(id),
  app_name TEXT NOT NULL,
  app_version TEXT DEFAULT '1.0.0',
  pwa_config JSONB DEFAULT '{}',
  push_notification_config JSONB DEFAULT '{}',
  offline_capabilities JSONB DEFAULT '{}',
  theme_config JSONB DEFAULT '{}',
  feature_flags JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business intelligence tables
CREATE TABLE IF NOT EXISTS public.bi_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID REFERENCES public.associations(id),
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'financial', 'operational', 'compliance', 'custom'
  query_definition JSONB NOT NULL,
  visualization_config JSONB DEFAULT '{}',
  schedule_config JSONB DEFAULT '{}',
  recipients JSONB DEFAULT '[]',
  is_automated BOOLEAN DEFAULT false,
  last_generated TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.ml_training_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_app_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for association-based access
CREATE POLICY "Users can access ML pipelines for their associations" ON public.ml_training_pipelines
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access document processing for their associations" ON public.document_processing_queue
  FOR ALL USING (true); -- TODO: Add proper association filtering

CREATE POLICY "Users can access workflow executions for their associations" ON public.workflow_executions
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access communication intelligence for their associations" ON public.communication_intelligence
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access analytics dashboards for their associations" ON public.analytics_dashboards
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access analytics metrics for their associations" ON public.analytics_metrics
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access IoT devices for their associations" ON public.iot_devices
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access IoT sensor data for their associations" ON public.iot_sensor_data
  FOR ALL USING (device_id IN (SELECT id FROM public.iot_devices WHERE check_user_association(association_id)));

CREATE POLICY "Users can access workflow schedules for their associations" ON public.workflow_schedules
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access workflow analytics for their associations" ON public.workflow_analytics
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access mobile app configs for their associations" ON public.mobile_app_configs
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access BI reports for their associations" ON public.bi_reports
  FOR ALL USING (check_user_association(association_id));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ml_training_pipelines_association_id ON public.ml_training_pipelines(association_id);
CREATE INDEX IF NOT EXISTS idx_document_processing_queue_status ON public.document_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_association_id ON public.workflow_executions(association_id);
CREATE INDEX IF NOT EXISTS idx_communication_intelligence_association_id ON public.communication_intelligence(association_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_association_id ON public.analytics_metrics(association_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_recorded_at ON public.analytics_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_iot_devices_association_id ON public.iot_devices(association_id);
CREATE INDEX IF NOT EXISTS idx_iot_sensor_data_device_id ON public.iot_sensor_data(device_id);
CREATE INDEX IF NOT EXISTS idx_iot_sensor_data_recorded_at ON public.iot_sensor_data(recorded_at);

-- Create triggers for updated_at
CREATE TRIGGER update_ml_training_pipelines_updated_at
  BEFORE UPDATE ON public.ml_training_pipelines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_processing_queue_updated_at
  BEFORE UPDATE ON public.document_processing_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_executions_updated_at
  BEFORE UPDATE ON public.workflow_executions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_communication_intelligence_updated_at
  BEFORE UPDATE ON public.communication_intelligence
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analytics_dashboards_updated_at
  BEFORE UPDATE ON public.analytics_dashboards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_iot_devices_updated_at
  BEFORE UPDATE ON public.iot_devices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_schedules_updated_at
  BEFORE UPDATE ON public.workflow_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mobile_app_configs_updated_at
  BEFORE UPDATE ON public.mobile_app_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bi_reports_updated_at
  BEFORE UPDATE ON public.bi_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();