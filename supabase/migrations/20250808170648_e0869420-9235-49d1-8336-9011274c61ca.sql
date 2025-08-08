BEGIN;
-- Set explicit search_path for hardened admin-only functions per linter guidance
CREATE OR REPLACE FUNCTION public.get_system_setting(setting_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.get_associations()
RETURNS SETOF associations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF public.get_current_user_role() <> 'admin' THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY SELECT * FROM associations ORDER BY name;
END;
$$;
COMMIT;