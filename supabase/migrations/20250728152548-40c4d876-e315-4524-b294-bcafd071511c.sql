-- Critical Security Fix: Phase 1 - Enable RLS and fix function search paths
-- Only targeting existing tables and functions

-- Fix function search paths for existing functions (addressing 70 warnings)
ALTER FUNCTION public.calculate_campaign_metrics(uuid) SET search_path TO 'public';
ALTER FUNCTION public.auto_allocate_payment(uuid) SET search_path TO 'public';
ALTER FUNCTION public.execute_form_workflow() SET search_path TO 'public';
ALTER FUNCTION public.generate_account_number(uuid, text) SET search_path TO 'public';
ALTER FUNCTION public.generate_order_number() SET search_path TO 'public';
ALTER FUNCTION public.check_totp_status(uuid) SET search_path TO 'public';
ALTER FUNCTION public.upsert_totp_secret(uuid, text, boolean) SET search_path TO 'public';
ALTER FUNCTION public.delete_totp_secret(uuid) SET search_path TO 'public';
ALTER FUNCTION public.set_totp_verified(uuid, boolean) SET search_path TO 'public';
ALTER FUNCTION public.verify_totp(uuid, text) SET search_path TO 'public';
ALTER FUNCTION public.global_search(text, integer, integer, text[]) SET search_path TO 'public';
ALTER FUNCTION public.get_next_tracking_number() SET search_path TO 'public';
ALTER FUNCTION public.create_resident_portal_settings() SET search_path TO 'public';
ALTER FUNCTION public.assign_user_to_association(uuid, uuid, text) SET search_path TO 'public';
ALTER FUNCTION public.get_user_associations() SET search_path TO 'public';
ALTER FUNCTION public.get_system_setting(text) SET search_path TO 'public';
ALTER FUNCTION public.update_system_setting(text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.log_financial_activity() SET search_path TO 'public';
ALTER FUNCTION public.get_associations() SET search_path TO 'public';
ALTER FUNCTION public.auto_assign_user_to_association() SET search_path TO 'public';
ALTER FUNCTION public.validate_document_upload(bigint, text) SET search_path TO 'public';
ALTER FUNCTION public.bulk_import_documents(jsonb, uuid, text) SET search_path TO 'public';
ALTER FUNCTION public.update_user_ai_settings(text, double precision, integer, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.get_user_settings(uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_user_settings(uuid, text, boolean, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.sync_missing_profiles() SET search_path TO 'public';
ALTER FUNCTION public.set_secret(text, text) SET search_path TO 'public';
ALTER FUNCTION public.get_secret(text) SET search_path TO 'public';
ALTER FUNCTION public.validate_resident_preferences(jsonb) SET search_path TO 'public';
ALTER FUNCTION public.set_default_notification_preferences() SET search_path TO 'public';
ALTER FUNCTION public.update_vendor_pattern(text, uuid, text, text, text) SET search_path TO 'public';
ALTER FUNCTION public.get_ai_suggestions(uuid, text, text) SET search_path TO 'public';
ALTER FUNCTION public.cleanup_processing_queue() SET search_path TO 'public';
ALTER FUNCTION public.cleanup_processing_results() SET search_path TO 'public';

-- Enable RLS on critical tables that exist but don't have RLS
ALTER TABLE public.communications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

-- Add critical RLS policies for communications_log
CREATE POLICY "Users can access communications log for their associations"
ON public.communications_log FOR SELECT
USING (
  metadata->>'association_id' IN (
    SELECT association_id::text FROM association_users 
    WHERE user_id = auth.uid()
  )
);

-- Add critical RLS policies for document_processing_queue
CREATE POLICY "Users can access document processing queue for their associations"
ON public.document_processing_queue FOR ALL
USING (
  document_id IN (
    SELECT d.id FROM documents d
    JOIN association_users au ON d.association_id = au.association_id
    WHERE au.user_id = auth.uid()
  )
);

-- Add critical RLS policies for workflow_executions
CREATE POLICY "Users can access workflow executions for their associations"
ON public.workflow_executions FOR ALL
USING (check_user_association(association_id));

-- Add critical RLS policies for workflows
CREATE POLICY "Users can access workflows for their associations"
ON public.workflows FOR ALL
USING (check_user_association(association_id));