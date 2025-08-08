BEGIN;

-- Standardize search_path for SECURITY DEFINER functions
ALTER FUNCTION public.generate_scheduled_assessments() SET search_path = 'public';
ALTER FUNCTION public.auto_allocate_payment(uuid) SET search_path = 'public';
ALTER FUNCTION public.get_current_user_role() SET search_path = 'public';
ALTER FUNCTION public.get_user_association_role(uuid) SET search_path = 'public';
ALTER FUNCTION public.user_is_association_admin(uuid) SET search_path = 'public';
ALTER FUNCTION public.user_is_associated_with_association(uuid) SET search_path = 'public';
ALTER FUNCTION public.assign_user_to_association(uuid, uuid, text) SET search_path = 'public';
ALTER FUNCTION public.auto_assign_user_to_association() SET search_path = 'public';
ALTER FUNCTION public.create_association_with_admin(text, text, text, text, text, text, text, text, text, integer) SET search_path = 'public';
ALTER FUNCTION public.log_financial_activity() SET search_path = 'public';
ALTER FUNCTION public.update_user_ai_settings(text, double precision, integer, jsonb) SET search_path = 'public';
ALTER FUNCTION public.check_totp_status(uuid) SET search_path = 'public';
ALTER FUNCTION public.handle_updated_at() SET search_path = 'public';

-- RLS for ai_processing_stats
ALTER TABLE public.ai_processing_stats ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'ai_processing_stats' 
      AND policyname = 'Users can select ai_processing_stats in their associations'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Users can select ai_processing_stats in their associations"
      ON public.ai_processing_stats
      FOR SELECT
      USING (check_user_association(association_id));
    $policy$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'ai_processing_stats' 
      AND policyname = 'Admins can modify ai_processing_stats in their associations'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admins can modify ai_processing_stats in their associations"
      ON public.ai_processing_stats
      FOR ALL
      USING (user_has_association_access(association_id, 'admin'))
      WITH CHECK (user_has_association_access(association_id, 'admin'));
    $policy$;
  END IF;
END $$;

COMMIT;