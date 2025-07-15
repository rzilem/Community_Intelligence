-- Phase 1: Enable RLS on association_users table (already has policies)
ALTER TABLE association_users ENABLE ROW LEVEL SECURITY;

-- Phase 2: Enable RLS on public tables that currently have no protection
ALTER TABLE account_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_types_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_document_processing_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_financial_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_maintenance_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_training_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_processing_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_resident_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_vendor_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_vision_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

-- Phase 3: Add basic RLS policies for tables using association-based access
CREATE POLICY "Users can access account credits for their associations" ON account_credits
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access accounts payable for their associations" ON accounts_payable
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access accounts receivable for their associations" ON accounts_receivable
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access assessment types enhanced for their associations" ON assessment_types_enhanced
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access AI conversation history for their associations" ON ai_conversation_history
  FOR ALL USING ((user_id = auth.uid()) AND check_user_association(association_id));

CREATE POLICY "Users can access document processing results for their associations" ON ai_document_processing_results
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access financial forecasts for their associations" ON ai_financial_forecasts
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "ai_corrections_access" ON ai_learning_corrections
  FOR ALL USING (invoice_id IN (
    SELECT invoices.id FROM invoices 
    WHERE invoices.association_id IN (
      SELECT association_users.association_id FROM association_users 
      WHERE association_users.user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can access maintenance predictions for their properties" ON ai_maintenance_predictions
  FOR ALL USING (property_id IN (
    SELECT p.id FROM properties p 
    JOIN association_users au ON p.association_id = au.association_id 
    WHERE au.user_id = auth.uid()
  ));

CREATE POLICY "Admin users can access AI model performance" ON ai_model_performance
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['admin'::user_role, 'manager'::user_role])
  ));

CREATE POLICY "Users can access AI training jobs for their associations" ON ai_model_training_jobs
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access AI predictions for their associations" ON ai_predictions
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "processing_queue_access" ON ai_processing_queue
  FOR ALL USING (association_id IN (
    SELECT association_users.association_id FROM association_users 
    WHERE association_users.user_id = auth.uid()
  ));

CREATE POLICY "processing_results_access" ON ai_processing_results
  FOR ALL USING (invoice_id IN (
    SELECT invoices.id FROM invoices 
    WHERE invoices.association_id IN (
      SELECT association_users.association_id FROM association_users 
      WHERE association_users.user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can access resident insights for their associations" ON ai_resident_insights
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can view their own AI settings" ON ai_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI settings" ON ai_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI settings" ON ai_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "vendor_patterns_access" ON ai_vendor_patterns
  FOR ALL USING (association_id IN (
    SELECT association_users.association_id FROM association_users 
    WHERE association_users.user_id = auth.uid()
  ));

CREATE POLICY "Users can access vision analysis results for their associations" ON ai_vision_analysis_results
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Analytics dashboards association access" ON analytics_dashboards
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Analytics metrics association access" ON analytics_metrics
  FOR ALL USING (check_user_association(association_id));

-- Phase 4: Fix search_path on functions to prevent schema injection
CREATE OR REPLACE FUNCTION public.update_user_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_timestamp_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_resident_invitations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_assessment_schedules_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_payment_transactions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_payment_methods_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_aging_days()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.aging_days = GREATEST(0, EXTRACT(days FROM CURRENT_DATE - NEW.due_date));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_residents_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_lead_follow_ups_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_homeowner_requests_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_communications_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_message_translations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_proposal_requests_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_system_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_import_jobs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_form_template_associations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_document_import_progress_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_ai_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_scheduled_messages_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_leads_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;