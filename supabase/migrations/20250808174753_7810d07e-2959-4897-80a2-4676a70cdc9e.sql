BEGIN;
ALTER FUNCTION public.bulk_import_documents(jsonb, uuid, text) SET search_path = 'public';
ALTER FUNCTION public.calculate_campaign_metrics(uuid) SET search_path = 'public';
ALTER FUNCTION public.get_user_associations() SET search_path = 'public';
ALTER FUNCTION public.update_system_setting(text, jsonb) SET search_path = 'public';
COMMIT;