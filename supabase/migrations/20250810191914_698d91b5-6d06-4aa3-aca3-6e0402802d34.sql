-- 1) Enable RLS and restrict access on ai_processing_stats
ALTER TABLE IF EXISTS public.ai_processing_stats ENABLE ROW LEVEL SECURITY;

-- Drop old policies if present to avoid duplicates
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'ai_processing_stats' 
      AND policyname = 'Users can access AI processing stats for their associations'
  ) THEN
    DROP POLICY "Users can access AI processing stats for their associations" ON public.ai_processing_stats;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'ai_processing_stats' 
      AND policyname = 'ai_processing_stats_select'
  ) THEN
    DROP POLICY "ai_processing_stats_select" ON public.ai_processing_stats;
  END IF;
END $$;

CREATE POLICY "Users can view AI processing stats for their associations"
ON public.ai_processing_stats
FOR SELECT
USING (check_user_association(association_id));


-- 2) Lock down association_users to prevent self-escalation
-- Remove overly-permissive policy allowing ALL by self
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'association_users' 
      AND policyname = 'Users can manage their own memberships'
  ) THEN
    DROP POLICY "Users can manage their own memberships" ON public.association_users;
  END IF;
END $$;

-- Explicit, minimal allowance: allow users to delete their own memberships
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'association_users' 
      AND policyname = 'Users can delete their own memberships'
  ) THEN
    DROP POLICY "Users can delete their own memberships" ON public.association_users;
  END IF;
END $$;

CREATE POLICY "Users can delete their own memberships"
ON public.association_users
FOR DELETE
USING (user_id = auth.uid());

-- Note: Admin/manager policies already exist for managing memberships


-- 3) Harden assign_user_to_association with authorization checks
CREATE OR REPLACE FUNCTION public.assign_user_to_association(
  p_association_id uuid,
  p_user_id uuid,
  p_role text DEFAULT 'member'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Caller must be association admin OR global admin
  IF NOT (public.user_is_association_admin(p_association_id) OR public.get_current_user_role() = 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin required to assign association members';
  END IF;

  -- Validate role
  IF p_role NOT IN ('member','manager','admin') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  -- Only global admins can assign the admin role
  IF p_role = 'admin' AND public.get_current_user_role() <> 'admin' THEN
    RAISE EXCEPTION 'Only global admins can assign the admin role';
  END IF;

  INSERT INTO public.association_users (association_id, user_id, role)
  VALUES (p_association_id, p_user_id, p_role)
  ON CONFLICT (association_id, user_id)
  DO UPDATE SET role = EXCLUDED.role, updated_at = now();
END;
$function$;

-- Restrict execute grants
REVOKE ALL ON FUNCTION public.assign_user_to_association(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_user_to_association(uuid, uuid, text) TO authenticated;


-- 4) Prevent role changes on profiles by non-admins via trigger
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF public.get_current_user_role() <> 'admin' THEN
      RAISE EXCEPTION 'Only global admins can change user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger (idempotent)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_prevent_profile_role_escalation'
  ) THEN
    DROP TRIGGER trg_prevent_profile_role_escalation ON public.profiles;
  END IF;
END $$;

CREATE TRIGGER trg_prevent_profile_role_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_role_escalation();