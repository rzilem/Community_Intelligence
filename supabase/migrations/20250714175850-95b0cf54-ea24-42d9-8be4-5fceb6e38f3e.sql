-- Phase 10: AI/ML Platform Completion & Workflow Automation (Fixed)

-- Create ML training pipeline tables
CREATE TABLE IF NOT EXISTS public.ml_training_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID REFERENCES public.associations(id),
  pipeline_name TEXT NOT NULL,
  model_type TEXT NOT NULL,
  training_status TEXT NOT NULL DEFAULT 'pending',
  dataset_size INTEGER DEFAULT 0,
  accuracy_score NUMERIC(5,4) DEFAULT 0,
  hyperparameters JSONB DEFAULT '{}',
  training_metrics JSONB DEFAULT '{}',
  model_version TEXT,
  deployed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow executions table  
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

-- Create communication intelligence table
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
  refresh_interval INTEGER DEFAULT 300,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID REFERENCES public.associations(id),
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC,
  dimensions JSONB DEFAULT '{}',
  aggregation_period TEXT DEFAULT 'daily',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create IoT integration tables
CREATE TABLE IF NOT EXISTS public.iot_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID REFERENCES public.associations(id),
  property_id UUID,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL,
  device_id TEXT UNIQUE NOT NULL,
  manufacturer TEXT,
  model TEXT,
  firmware_version TEXT,
  status TEXT DEFAULT 'active',
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
  sensor_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
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
  report_type TEXT NOT NULL,
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

-- Enable RLS on new tables (skip existing ones)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ml_training_pipelines' AND schemaname = 'public') THEN
    ALTER TABLE public.ml_training_pipelines ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "ML pipelines association access" ON public.ml_training_pipelines
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY IF NOT EXISTS "Workflow executions association access" ON public.workflow_executions
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY IF NOT EXISTS "Communication intelligence association access" ON public.communication_intelligence
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY IF NOT EXISTS "Analytics dashboards association access" ON public.analytics_dashboards
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY IF NOT EXISTS "Analytics metrics association access" ON public.analytics_metrics
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY IF NOT EXISTS "IoT devices association access" ON public.iot_devices
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY IF NOT EXISTS "IoT sensor data device access" ON public.iot_sensor_data
  FOR ALL USING (device_id IN (SELECT id FROM public.iot_devices WHERE check_user_association(association_id)));

CREATE POLICY IF NOT EXISTS "Workflow schedules association access" ON public.workflow_schedules
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY IF NOT EXISTS "Mobile app configs association access" ON public.mobile_app_configs
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY IF NOT EXISTS "BI reports association access" ON public.bi_reports
  FOR ALL USING (check_user_association(association_id));