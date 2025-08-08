BEGIN;

-- Standardize search_path for SECURITY DEFINER functions (corrected signatures)
ALTER FUNCTION public.generate_scheduled_assessments() SET search_path = 'public';
ALTER FUNCTION public.auto_allocate_payment(uuid) SET search_path = 'public';
ALTER FUNCTION public.get_current_user_role() SET search_path = 'public';
ALTER FUNCTION public.get_user_association_role(uuid) SET search_path = 'public';
ALTER FUNCTION public.user_is_association_admin(uuid) SET search_path = 'public';
ALTER FUNCTION public.user_is_associated_with_association(uuid) SET search_path = 'public';
ALTER FUNCTION public.assign_user_to_association(uuid, uuid, text) SET search_path = 'public';
ALTER FUNCTION public.auto_assign_user_to_association() SET search_path = 'public';
ALTER FUNCTION public.create_association_with_admin(text, text, text, text, text, text, text, text, integer) SET search_path = 'public';
ALTER FUNCTION public.log_financial_activity() SET search_path = 'public';
ALTER FUNCTION public.update_user_ai_settings(text, double precision, integer, jsonb) SET search_path = 'public';
ALTER FUNCTION public.check_totp_status(uuid) SET search_path = 'public';
ALTER FUNCTION public.handle_updated_at() SET search_path = 'public';

-- Restrict direct access to view; enforce access via secured RPC
REVOKE SELECT ON public.ai_processing_stats FROM anon;
REVOKE SELECT ON public.ai_processing_stats FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_ai_processing_stats(uuid) TO authenticated;

COMMIT;