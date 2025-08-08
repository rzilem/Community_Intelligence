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

COMMIT;