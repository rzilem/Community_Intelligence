-- AI Analytics Platform Tables

-- Document Processing Results
CREATE TABLE IF NOT EXISTS public.ai_document_processing_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('contract', 'invoice', 'compliance', 'maintenance', 'legal', 'financial')),
  extracted_data JSONB NOT NULL DEFAULT '{}',
  confidence NUMERIC(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  metadata JSONB NOT NULL DEFAULT '{}',
  risk_assessment JSONB,
  compliance_check JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vision Analysis Results
CREATE TABLE IF NOT EXISTS public.ai_vision_analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  property_id UUID,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('property_condition', 'violation_detection', 'maintenance_issue', 'insurance_claim')),
  findings JSONB NOT NULL DEFAULT '[]',
  overall_score NUMERIC(3,2) CHECK (overall_score >= 0 AND overall_score <= 1),
  recommendations TEXT[],
  estimated_cost NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Financial Forecasts
CREATE TABLE IF NOT EXISTS public.ai_financial_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  forecast_type TEXT NOT NULL CHECK (forecast_type IN ('cash_flow', 'budget_variance', 'delinquency', 'property_value', 'assessment_optimization')),
  predictions JSONB NOT NULL DEFAULT '[]',
  accuracy NUMERIC(3,2) NOT NULL CHECK (accuracy >= 0 AND accuracy <= 1),
  recommendations JSONB NOT NULL DEFAULT '[]',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Maintenance Predictions
CREATE TABLE IF NOT EXISTS public.ai_maintenance_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  equipment_type TEXT NOT NULL,
  prediction_type TEXT NOT NULL CHECK (prediction_type IN ('failure', 'maintenance_due', 'lifecycle_end', 'cost_spike')),
  probability NUMERIC(3,2) NOT NULL CHECK (probability >= 0 AND probability <= 1),
  timeframe JSONB NOT NULL,
  estimated_cost JSONB NOT NULL,
  preventive_actions TEXT[],
  risk_factors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Resident Insights
CREATE TABLE IF NOT EXISTS public.ai_resident_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('satisfaction', 'engagement', 'payment_behavior', 'service_usage', 'communication_preference')),
  patterns JSONB NOT NULL DEFAULT '[]',
  recommendations TEXT[],
  action_items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Conversation History
CREATE TABLE IF NOT EXISTS public.ai_conversation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  user_id UUID NOT NULL,
  conversation_id UUID NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Model Training Jobs
CREATE TABLE IF NOT EXISTS public.ai_model_training_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  model_type TEXT NOT NULL CHECK (model_type IN ('financial', 'maintenance', 'resident', 'document', 'vision')),
  job_status TEXT NOT NULL DEFAULT 'pending' CHECK (job_status IN ('pending', 'running', 'completed', 'failed')),
  training_data_size INTEGER DEFAULT 0,
  accuracy_improvement NUMERIC(3,2),
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all AI tables
ALTER TABLE public.ai_document_processing_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_vision_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_financial_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_maintenance_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_resident_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_training_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI Analytics Tables

-- Document Processing Results
CREATE POLICY "Users can access document processing results for their associations"
ON public.ai_document_processing_results
FOR ALL
USING (check_user_association(association_id));

-- Vision Analysis Results
CREATE POLICY "Users can access vision analysis results for their associations"
ON public.ai_vision_analysis_results
FOR ALL
USING (check_user_association(association_id));

-- Financial Forecasts
CREATE POLICY "Users can access financial forecasts for their associations"
ON public.ai_financial_forecasts
FOR ALL
USING (check_user_association(association_id));

-- Maintenance Predictions
CREATE POLICY "Users can access maintenance predictions for their properties"
ON public.ai_maintenance_predictions
FOR ALL
USING (
  property_id IN (
    SELECT p.id FROM properties p
    JOIN association_users au ON p.association_id = au.association_id
    WHERE au.user_id = auth.uid()
  )
);

-- Resident Insights
CREATE POLICY "Users can access resident insights for their associations"
ON public.ai_resident_insights
FOR ALL
USING (check_user_association(association_id));

-- AI Conversation History
CREATE POLICY "Users can access their own AI conversations"
ON public.ai_conversation_history
FOR ALL
USING (user_id = auth.uid() AND check_user_association(association_id));

-- AI Model Training Jobs
CREATE POLICY "Users can access AI training jobs for their associations"
ON public.ai_model_training_jobs
FOR ALL
USING (check_user_association(association_id));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_document_processing_association ON public.ai_document_processing_results(association_id);
CREATE INDEX IF NOT EXISTS idx_ai_document_processing_type ON public.ai_document_processing_results(document_type);
CREATE INDEX IF NOT EXISTS idx_ai_document_processing_created ON public.ai_document_processing_results(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_vision_analysis_association ON public.ai_vision_analysis_results(association_id);
CREATE INDEX IF NOT EXISTS idx_ai_vision_analysis_property ON public.ai_vision_analysis_results(property_id);
CREATE INDEX IF NOT EXISTS idx_ai_vision_analysis_type ON public.ai_vision_analysis_results(analysis_type);

CREATE INDEX IF NOT EXISTS idx_ai_financial_forecasts_association ON public.ai_financial_forecasts(association_id);
CREATE INDEX IF NOT EXISTS idx_ai_financial_forecasts_type ON public.ai_financial_forecasts(forecast_type);
CREATE INDEX IF NOT EXISTS idx_ai_financial_forecasts_created ON public.ai_financial_forecasts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_maintenance_predictions_property ON public.ai_maintenance_predictions(property_id);
CREATE INDEX IF NOT EXISTS idx_ai_maintenance_predictions_type ON public.ai_maintenance_predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_ai_maintenance_predictions_probability ON public.ai_maintenance_predictions(probability DESC);

CREATE INDEX IF NOT EXISTS idx_ai_resident_insights_association ON public.ai_resident_insights(association_id);
CREATE INDEX IF NOT EXISTS idx_ai_resident_insights_type ON public.ai_resident_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_resident_insights_created ON public.ai_resident_insights(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_conversation_history_association ON public.ai_conversation_history(association_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_history_user ON public.ai_conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_history_conversation ON public.ai_conversation_history(conversation_id);

CREATE INDEX IF NOT EXISTS idx_ai_model_training_jobs_association ON public.ai_model_training_jobs(association_id);
CREATE INDEX IF NOT EXISTS idx_ai_model_training_jobs_status ON public.ai_model_training_jobs(job_status);
CREATE INDEX IF NOT EXISTS idx_ai_model_training_jobs_type ON public.ai_model_training_jobs(model_type);

-- Triggers for updated_at columns
CREATE TRIGGER update_ai_document_processing_results_updated_at
  BEFORE UPDATE ON public.ai_document_processing_results
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_ai_vision_analysis_results_updated_at
  BEFORE UPDATE ON public.ai_vision_analysis_results
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_ai_financial_forecasts_updated_at
  BEFORE UPDATE ON public.ai_financial_forecasts
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_ai_maintenance_predictions_updated_at
  BEFORE UPDATE ON public.ai_maintenance_predictions
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_ai_resident_insights_updated_at
  BEFORE UPDATE ON public.ai_resident_insights
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_ai_model_training_jobs_updated_at
  BEFORE UPDATE ON public.ai_model_training_jobs
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();