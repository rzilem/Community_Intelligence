-- Critical Security Fix: Enable RLS and add policies for tables without RLS
-- This addresses the 16 critical RLS disabled tables

-- 1. Enable RLS on all public tables that are missing it
ALTER TABLE public.assessment_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_proposals ENABLE ROW LEVEL SECURITY;

-- 2. Add basic RLS policies for assessment_line_items
CREATE POLICY "Users can access assessment line items for their associations"
ON public.assessment_line_items FOR ALL
USING (
  assessment_id IN (
    SELECT a.id FROM assessments a
    JOIN properties p ON a.property_id = p.id
    JOIN association_users au ON p.association_id = au.association_id
    WHERE au.user_id = auth.uid()
  )
);

-- 3. Add basic RLS policies for automation_rules
CREATE POLICY "Users can manage automation rules for their associations"
ON public.automation_rules FOR ALL
USING (check_user_association(association_id));

-- 4. Add basic RLS policies for bid_requests
CREATE POLICY "Users can access bid requests for their associations"
ON public.bid_requests FOR ALL
USING (
  association_id IN (
    SELECT association_id FROM association_users 
    WHERE user_id = auth.uid()
  )
);

-- 5. Add basic RLS policies for bookings
CREATE POLICY "Users can manage bookings for their associations"
ON public.bookings FOR ALL
USING (
  amenity_id IN (
    SELECT a.id FROM amenities a
    JOIN association_users au ON a.association_id = au.association_id
    WHERE au.user_id = auth.uid()
  )
);

-- 6. Add basic RLS policies for communications_log
CREATE POLICY "Users can access communications log for their associations"
ON public.communications_log FOR SELECT
USING (
  metadata->>'association_id' IN (
    SELECT association_id::text FROM association_users 
    WHERE user_id = auth.uid()
  )
);

-- 7. Add basic RLS policies for compliance_issues
CREATE POLICY "Users can manage compliance issues for their associations"
ON public.compliance_issues FOR ALL
USING (
  property_id IN (
    SELECT p.id FROM properties p
    JOIN association_users au ON p.association_id = au.association_id
    WHERE au.user_id = auth.uid()
  )
);

-- 8. Add basic RLS policies for document_processing_queue
CREATE POLICY "Users can access document processing queue for their associations"
ON public.document_processing_queue FOR ALL
USING (
  document_id IN (
    SELECT d.id FROM documents d
    JOIN association_users au ON d.association_id = au.association_id
    WHERE au.user_id = auth.uid()
  )
);

-- 9. Add basic RLS policies for document_templates
CREATE POLICY "Users can access document templates for their associations"
ON public.document_templates FOR ALL
USING (check_user_association(association_id));

-- 10. Add basic RLS policies for emergency_contacts
CREATE POLICY "Users can manage emergency contacts for their associations"
ON public.emergency_contacts FOR ALL
USING (
  property_id IN (
    SELECT p.id FROM properties p
    JOIN association_users au ON p.association_id = au.association_id
    WHERE au.user_id = auth.uid()
  )
);

-- 11. Add basic RLS policies for events
CREATE POLICY "Users can manage events for their associations"
ON public.events FOR ALL
USING (check_user_association(association_id));

-- 12. Add basic RLS policies for file_uploads
CREATE POLICY "Users can access their own file uploads"
ON public.file_uploads FOR ALL
USING (uploaded_by = auth.uid());

-- 13. Add basic RLS policies for form_submissions
CREATE POLICY "Users can access form submissions for their associations"
ON public.form_submissions FOR ALL
USING (
  form_template_id IN (
    SELECT ft.id FROM form_templates ft
    JOIN association_users au ON ft.association_id = au.association_id
    WHERE au.user_id = auth.uid()
  )
);

-- 14. Add basic RLS policies for invoice_line_items
CREATE POLICY "Users can access invoice line items for their associations"
ON public.invoice_line_items FOR ALL
USING (
  invoice_id IN (
    SELECT i.id FROM invoices i
    JOIN association_users au ON i.association_id = au.association_id
    WHERE au.user_id = auth.uid()
  )
);

-- 15. Add basic RLS policies for maintenance_requests
CREATE POLICY "Users can access maintenance requests for their associations"
ON public.maintenance_requests FOR ALL
USING (
  property_id IN (
    SELECT p.id FROM properties p
    JOIN association_users au ON p.association_id = au.association_id
    WHERE au.user_id = auth.uid()
  )
);

-- 16. Add basic RLS policies for notifications
CREATE POLICY "Users can access their own notifications"
ON public.notifications FOR ALL
USING (user_id = auth.uid());

-- 17. Add basic RLS policies for vendor_proposals
CREATE POLICY "Users can access vendor proposals for their associations"
ON public.vendor_proposals FOR ALL
USING (
  bid_request_id IN (
    SELECT br.id FROM bid_requests br
    JOIN association_users au ON br.association_id = au.association_id
    WHERE au.user_id = auth.uid()
  )
);

-- Fix functions with mutable search paths by adding SECURITY DEFINER and SET search_path
-- This addresses the 70 function search path warnings

-- Update functions to have proper search_path settings
ALTER FUNCTION public.update_resident_invitations_updated_at() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_assessment_schedules_updated_at() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_payment_transactions_updated_at() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_payment_methods_updated_at() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.calculate_campaign_metrics(uuid) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_campaign_metrics() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.auto_allocate_payment(uuid) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_lead_follow_ups_updated_at() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_proposal_count() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_homeowner_requests_updated_at() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.execute_form_workflow() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.generate_account_number(uuid, text) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.generate_order_number() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.check_totp_status(uuid) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.upsert_totp_secret(uuid, text, boolean) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.delete_totp_secret(uuid) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.set_totp_verified(uuid, boolean) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.verify_totp(uuid, text) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.global_search(text, integer, integer, text[]) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.get_next_tracking_number() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_message_translations_updated_at() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_proposal_requests_updated_at() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.create_resident_portal_settings() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.assign_user_to_association(uuid, uuid, text) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.get_user_associations() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.get_system_setting(text) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_system_setting(text, jsonb) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_system_settings_updated_at() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.log_financial_activity() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_import_jobs_updated_at() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_form_template_associations_updated_at() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.get_associations() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.auto_assign_user_to_association() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.validate_document_upload(bigint, text) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_document_import_progress_updated_at() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.bulk_import_documents(jsonb, uuid, text) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_user_ai_settings(text, double precision, integer, jsonb) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_ai_settings_updated_at() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.get_user_settings(uuid) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_user_settings(uuid, text, boolean, jsonb) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.sync_missing_profiles() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.set_secret(text, text) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.get_secret(text) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_vendor_stats_on_bid_selection() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_scheduled_messages_updated_at() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.validate_resident_preferences(jsonb) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.set_default_notification_preferences() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_leads_updated_at() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_vendor_pattern(text, uuid, text, text, text) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.get_ai_suggestions(uuid, text, text) SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.cleanup_processing_queue() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.cleanup_processing_results() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.trigger_set_updated_at() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.update_modified_column() SECURITY DEFINER SET search_path TO 'public';