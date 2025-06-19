
-- Create tables for AI-powered workflow automation (handling existing tables gracefully)

-- Check and create workflow_executions table if it doesn't exist
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_template_id UUID REFERENCES workflow_templates(id),
  association_id UUID REFERENCES associations(id),
  status TEXT NOT NULL DEFAULT 'pending',
  execution_data JSONB NOT NULL DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  ai_insights JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document intelligence and processing
CREATE TABLE IF NOT EXISTS document_processing_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  processing_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  ai_classification JSONB DEFAULT '{}',
  confidence_score NUMERIC DEFAULT 0,
  extracted_data JSONB DEFAULT '{}',
  processing_results JSONB DEFAULT '{}',
  workflow_triggers JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Predictive analytics and insights
CREATE TABLE IF NOT EXISTS ai_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID REFERENCES associations(id),
  prediction_type TEXT NOT NULL,
  prediction_data JSONB NOT NULL DEFAULT '{}',
  confidence_level NUMERIC NOT NULL DEFAULT 0,
  actual_outcome JSONB DEFAULT NULL,
  accuracy_score NUMERIC DEFAULT NULL,
  model_version TEXT DEFAULT 'v1.0',
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Communication intelligence
CREATE TABLE IF NOT EXISTS communication_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  communication_id UUID,
  association_id UUID REFERENCES associations(id),
  message_content TEXT NOT NULL,
  ai_category TEXT,
  sentiment_score NUMERIC DEFAULT 0,
  urgency_level TEXT DEFAULT 'normal',
  suggested_responses JSONB DEFAULT '[]',
  auto_routing_rules JSONB DEFAULT '{}',
  confidence_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Advanced automation rules
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID REFERENCES associations(id),
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  action_sequence JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  learning_enabled BOOLEAN DEFAULT TRUE,
  performance_stats JSONB DEFAULT '{}',
  last_executed TIMESTAMP WITH TIME ZONE,
  execution_count INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 100,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Workflow analytics and performance tracking
CREATE TABLE IF NOT EXISTS workflow_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_execution_id UUID REFERENCES workflow_executions(id),
  association_id UUID REFERENCES associations(id),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_type TEXT NOT NULL,
  measurement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI training data and model performance
CREATE TABLE IF NOT EXISTS ai_model_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_name TEXT NOT NULL,
  model_version TEXT NOT NULL,
  performance_metrics JSONB NOT NULL DEFAULT '{}',
  training_data_size INTEGER DEFAULT 0,
  accuracy_score NUMERIC DEFAULT 0,
  last_trained TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Event sourcing for audit trails
CREATE TABLE IF NOT EXISTS workflow_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id),
  association_id UUID REFERENCES associations(id),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  correlation_id UUID DEFAULT gen_random_uuid()
);

-- Add indexes for better performance (using IF NOT EXISTS where supported)
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_document_processing_status ON document_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_type ON ai_predictions(prediction_type, association_id);
CREATE INDEX IF NOT EXISTS idx_communication_intelligence_category ON communication_intelligence(ai_category);
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON automation_rules(is_active, association_id);
CREATE INDEX IF NOT EXISTS idx_workflow_events_entity ON workflow_events(entity_type, entity_id);

-- Add Row Level Security
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can access workflow executions for their associations" ON workflow_executions
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access document processing for their associations" ON document_processing_queue
  FOR ALL USING (EXISTS (
    SELECT 1 FROM documents d WHERE d.id = document_processing_queue.document_id 
    AND check_user_association(d.association_id)
  ));

CREATE POLICY "Users can access AI predictions for their associations" ON ai_predictions
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access communication intelligence for their associations" ON communication_intelligence
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access automation rules for their associations" ON automation_rules
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access workflow analytics for their associations" ON workflow_analytics
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Admin users can access AI model performance" ON ai_model_performance
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
  ));

CREATE POLICY "Users can access workflow events for their associations" ON workflow_events
  FOR ALL USING (check_user_association(association_id));

-- Add update triggers
CREATE TRIGGER update_workflow_executions_updated_at
  BEFORE UPDATE ON workflow_executions
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_document_processing_queue_updated_at
  BEFORE UPDATE ON document_processing_queue
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_ai_predictions_updated_at
  BEFORE UPDATE ON ai_predictions
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_communication_intelligence_updated_at
  BEFORE UPDATE ON communication_intelligence
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON automation_rules
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_ai_model_performance_updated_at
  BEFORE UPDATE ON ai_model_performance
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
