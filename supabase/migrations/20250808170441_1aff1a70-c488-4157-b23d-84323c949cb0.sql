BEGIN;
-- 1) Remove dangerous arbitrary SQL executor
DROP FUNCTION IF EXISTS public.execute_sql(text, jsonb);

-- 2) Harden get_system_setting to admin-only
CREATE OR REPLACE FUNCTION public.get_system_setting(setting_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  IF public.get_current_user_role() <> 'admin' THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  SELECT value INTO result FROM public.system_settings WHERE key = setting_key;
  RETURN result;
END;
$$;

-- 3) Harden get_associations to admin-only
CREATE OR REPLACE FUNCTION public.get_associations()
RETURNS SETOF associations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF public.get_current_user_role() <> 'admin' THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY SELECT * FROM associations ORDER BY name;
END;
$$;

-- 4) Enable RLS and add least-privilege policy for ai_processing_stats
ALTER TABLE public.ai_processing_stats ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'ai_processing_stats' 
      AND policyname = 'ai_processing_stats_association_access'
  ) THEN
    CREATE POLICY "ai_processing_stats_association_access"
    ON public.ai_processing_stats
    FOR ALL
    USING (check_user_association(association_id))
    WITH CHECK (check_user_association(association_id));
  END IF;
END $$;

COMMIT;