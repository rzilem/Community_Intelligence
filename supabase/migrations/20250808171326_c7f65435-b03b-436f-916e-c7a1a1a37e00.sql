
BEGIN;

-- 1) Restrict direct access to ai_processing_stats (likely a view) and add safe RPC wrapper
DO $$
BEGIN
  -- Revoke broad/public access first
  BEGIN
    REVOKE SELECT ON public.ai_processing_stats FROM PUBLIC;
  EXCEPTION WHEN undefined_table THEN
    -- View may not exist in some environments
    NULL;
  END;

  BEGIN
    REVOKE SELECT ON public.ai_processing_stats FROM anon;
  EXCEPTION WHEN undefined_object THEN
    NULL;
  END;

  BEGIN
    REVOKE SELECT ON public.ai_processing_stats FROM authenticated;
  EXCEPTION WHEN undefined_object THEN
    NULL;
  END;
END $$;

CREATE OR REPLACE FUNCTION public.get_ai_processing_stats(p_association_id uuid)
RETURNS SETOF public.ai_processing_stats
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.check_user_association(p_association_id) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT s.*
  FROM public.ai_processing_stats s
  WHERE s.association_id = p_association_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_ai_processing_stats(uuid) TO authenticated;

-- 2) Fix SECURITY DEFINER RPCs that should be INVOKER + add explicit checks

-- get_user_settings: ensure only self or admin; run as invoker so RLS applies
CREATE OR REPLACE FUNCTION public.get_user_settings(user_id_param uuid)
RETURNS SETOF public.user_settings
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  IF user_id_param <> auth.uid() AND public.get_current_user_role() <> 'admin' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
    SELECT *
    FROM public.user_settings
    WHERE user_id = user_id_param;
END;
$$;

-- update_user_settings: same guard; invoker mode, RLS enforces ownership
CREATE OR REPLACE FUNCTION public.update_user_settings(
  user_id_param uuid,
  theme_param text DEFAULT NULL,
  notifications_param boolean DEFAULT NULL,
  column_preferences_param jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  IF user_id_param <> auth.uid() AND public.get_current_user_role() <> 'admin' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  UPDATE public.user_settings
  SET
    theme = COALESCE(theme_param, theme),
    notifications_enabled = COALESCE(notifications_param, notifications_enabled),
    column_preferences = COALESCE(column_preferences_param, column_preferences),
    updated_at = NOW()
  WHERE user_id = user_id_param;
END;
$$;

-- global_search: remove SECURITY DEFINER; keep behavior, rely on underlying RLS protections
CREATE OR REPLACE FUNCTION public.global_search(
  search_query text,
  result_limit integer DEFAULT 20,
  result_offset integer DEFAULT 0,
  search_types text[] DEFAULT ARRAY['association', 'request', 'lead', 'invoice']
)
RETURNS TABLE(
  id uuid,
  type text,
  title text,
  subtitle text,
  path text,
  rank real,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    gsv.id,
    gsv.type,
    gsv.title,
    gsv.subtitle,
    gsv.path,
    ts_rank(gsv.search_vector, plainto_tsquery('english', search_query)) as rank,
    gsv.created_at
  FROM public.global_search_view gsv
  WHERE 
    gsv.search_vector @@ plainto_tsquery('english', search_query)
    AND gsv.type = ANY(search_types)
  ORDER BY 
    ts_rank(gsv.search_vector, plainto_tsquery('english', search_query)) DESC,
    gsv.created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$function$;

-- sync_missing_profiles: admin-only (queries auth.users), keep DEFINER but gate it; set search_path
CREATE OR REPLACE FUNCTION public.sync_missing_profiles()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  auth_user RECORD;
  profile_exists BOOLEAN;
  created_count INTEGER := 0;
  result json;
BEGIN
  IF public.get_current_user_role() <> 'admin' THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  FOR auth_user IN 
    SELECT id, email, raw_user_meta_data 
    FROM auth.users
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth_user.id
    ) INTO profile_exists;
    
    IF NOT profile_exists THEN
      INSERT INTO public.profiles (
        id, 
        email, 
        first_name, 
        last_name, 
        role
      ) VALUES (
        auth_user.id, 
        auth_user.email, 
        auth_user.raw_user_meta_data->>'first_name', 
        auth_user.raw_user_meta_data->>'last_name', 
        'user'
      );
      
      created_count := created_count + 1;
    END IF;
  END LOOP;
  
  SELECT json_build_object(
    'success', true,
    'created_count', created_count
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 3) Standardize search_path for SECURITY DEFINER functions missing it
-- (idempotent ALTERs; safe if already set)
DO $$
BEGIN
  -- common no-arg trigger helpers
  BEGIN EXECUTE 'ALTER FUNCTION public.update_user_settings_updated_at() SET search_path TO ''public'''; EXCEPTION WHEN undefined_function THEN NULL; END;
  BEGIN EXECUTE 'ALTER FUNCTION public.update_timestamp_column() SET search_path TO ''public'''; EXCEPTION WHEN undefined_function THEN NULL; END;
  BEGIN EXECUTE 'ALTER FUNCTION public.update_aging_days() SET search_path TO ''public'''; EXCEPTION WHEN undefined_function THEN NULL; END;
  BEGIN EXECUTE 'ALTER FUNCTION public.update_residents_updated_at() SET search_path TO ''public'''; EXCEPTION WHEN undefined_function THEN NULL; END;
  BEGIN EXECUTE 'ALTER FUNCTION public.update_communications_updated_at() SET search_path TO ''public'''; EXCEPTION WHEN undefined_function THEN NULL; END;
  BEGIN EXECUTE 'ALTER FUNCTION public.trigger_set_timestamp() SET search_path TO ''public'''; EXCEPTION WHEN undefined_function THEN NULL; END;
  BEGIN EXECUTE 'ALTER FUNCTION public.trigger_set_updated_at() SET search_path TO ''public'''; EXCEPTION WHEN undefined_function THEN NULL; END;
  BEGIN EXECUTE 'ALTER FUNCTION public.update_message_translations_updated_at() SET search_path TO ''public'''; EXCEPTION WHEN undefined_function THEN NULL; END;
  BEGIN EXECUTE 'ALTER FUNCTION public.update_proposal_requests_updated_at() SET search_path TO ''public'''; EXCEPTION WHEN undefined_function THEN NULL; END;
  BEGIN EXECUTE 'ALTER FUNCTION public.update_homeowner_requests_updated_at() SET search_path TO ''public'''; EXCEPTION WHEN undefined_function THEN NULL; END;
  BEGIN EXECUTE 'ALTER FUNCTION public.update_import_jobs_updated_at() SET search_path TO ''public'''; EXCEPTION WHEN undefined_function THEN NULL; END;
  BEGIN EXECUTE 'ALTER FUNCTION public.update_form_template_associations_updated_at() SET search_path TO ''public'''; EXCEPTION WHEN undefined_function THEN NULL; END;

  -- functions without explicit search_path but with DEFINER that we keep
  BEGIN EXECUTE 'ALTER FUNCTION public.handle_new_user() SET search_path TO ''public'''; EXCEPTION WHEN undefined_function THEN NULL; END;
  BEGIN EXECUTE 'ALTER FUNCTION public.check_association_admin(uuid) SET search_path TO ''public'''; EXCEPTION WHEN undefined_function THEN NULL; END;
END $$;

-- 4) Add least-privilege RLS policies for tables with RLS enabled but no policies

-- maintenance_requests
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='maintenance_requests' AND policyname='maintenance_requests_select_members') THEN
    CREATE POLICY "maintenance_requests_select_members"
      ON public.maintenance_requests
      FOR SELECT
      USING (
        property_id IN (
          SELECT p.id
          FROM public.properties p
          JOIN public.association_users au ON au.association_id = p.association_id
          WHERE au.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='maintenance_requests' AND policyname='maintenance_requests_insert_manager') THEN
    CREATE POLICY "maintenance_requests_insert_manager"
      ON public.maintenance_requests
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.properties p
          WHERE p.id = maintenance_requests.property_id
            AND public.user_has_association_access(p.association_id, 'manager')
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='maintenance_requests' AND policyname='maintenance_requests_update_manager') THEN
    CREATE POLICY "maintenance_requests_update_manager"
      ON public.maintenance_requests
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1
          FROM public.properties p
          WHERE p.id = maintenance_requests.property_id
            AND public.user_has_association_access(p.association_id, 'manager')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.properties p
          WHERE p.id = maintenance_requests.property_id
            AND public.user_has_association_access(p.association_id, 'manager')
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='maintenance_requests' AND policyname='maintenance_requests_delete_admin') THEN
    CREATE POLICY "maintenance_requests_delete_admin"
      ON public.maintenance_requests
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1
          FROM public.properties p
          WHERE p.id = maintenance_requests.property_id
            AND public.user_has_association_access(p.association_id, 'admin')
        )
      );
  END IF;
END $$;

-- vendor_bids
ALTER TABLE public.vendor_bids ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vendor_bids' AND policyname='vendor_bids_select_members') THEN
    CREATE POLICY "vendor_bids_select_members"
      ON public.vendor_bids
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.bid_requests br
          JOIN public.association_users au ON au.association_id = br.association_id
          WHERE br.id = vendor_bids.bid_request_id
            AND au.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vendor_bids' AND policyname='vendor_bids_write_manager') THEN
    CREATE POLICY "vendor_bids_write_manager"
      ON public.vendor_bids
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM public.bid_requests br
          WHERE br.id = vendor_bids.bid_request_id
            AND public.user_has_association_access(br.association_id, 'manager')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.bid_requests br
          WHERE br.id = vendor_bids.bid_request_id
            AND public.user_has_association_access(br.association_id, 'manager')
        )
      );
  END IF;

  -- Stronger delete (admin) if desired:
  -- You can replace FOR ALL with separate delete policy requiring 'admin'
END $$;

-- bid_evaluations
ALTER TABLE public.bid_evaluations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bid_evaluations' AND policyname='bid_evaluations_select_members') THEN
    CREATE POLICY "bid_evaluations_select_members"
      ON public.bid_evaluations
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.bid_requests br
          JOIN public.association_users au ON au.association_id = br.association_id
          WHERE br.id = bid_evaluations.bid_request_id
            AND au.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bid_evaluations' AND policyname='bid_evaluations_write_manager') THEN
    CREATE POLICY "bid_evaluations_write_manager"
      ON public.bid_evaluations
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM public.bid_requests br
          WHERE br.id = bid_evaluations.bid_request_id
            AND public.user_has_association_access(br.association_id, 'manager')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.bid_requests br
          WHERE br.id = bid_evaluations.bid_request_id
            AND public.user_has_association_access(br.association_id, 'manager')
        )
      );
  END IF;
END $$;

-- user_sessions (user can access only their own sessions)
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='user_sessions_select_own') THEN
    CREATE POLICY "user_sessions_select_own"
      ON public.user_sessions
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='user_sessions_modify_own') THEN
    CREATE POLICY "user_sessions_modify_own"
      ON public.user_sessions
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "user_sessions_update_own"
      ON public.user_sessions
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "user_sessions_delete_own"
      ON public.user_sessions
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Admin-only tables
-- form_workflow_execution_logs
ALTER TABLE public.form_workflow_execution_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='form_workflow_execution_logs' AND policyname='form_workflow_logs_admin_all') THEN
    CREATE POLICY "form_workflow_logs_admin_all"
      ON public.form_workflow_execution_logs
      FOR ALL
      USING (public.get_current_user_role() = 'admin')
      WITH CHECK (public.get_current_user_role() = 'admin');
  END IF;
END $$;

-- ip_whitelist
ALTER TABLE public.ip_whitelist ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ip_whitelist' AND policyname='ip_whitelist_admin_all') THEN
    CREATE POLICY "ip_whitelist_admin_all"
      ON public.ip_whitelist
      FOR ALL
      USING (public.get_current_user_role() = 'admin')
      WITH CHECK (public.get_current_user_role() = 'admin');
  END IF;
END $$;

-- security_policies
ALTER TABLE public.security_policies ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='security_policies' AND policyname='security_policies_admin_all') THEN
    CREATE POLICY "security_policies_admin_all"
      ON public.security_policies
      FOR ALL
      USING (public.get_current_user_role() = 'admin')
      WITH CHECK (public.get_current_user_role() = 'admin');
  END IF;
END $$;

-- tenant_users
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tenant_users' AND policyname='tenant_users_admin_all') THEN
    CREATE POLICY "tenant_users_admin_all"
      ON public.tenant_users
      FOR ALL
      USING (public.get_current_user_role() = 'admin')
      WITH CHECK (public.get_current_user_role() = 'admin');
  END IF;
END $$;

COMMIT;
