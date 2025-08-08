-- Phase 1: RLS hardening and policy fixes
-- 1) Tighten api_keys access (was overly permissive)
DO $$
BEGIN
  -- Drop existing overly-permissive policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'api_keys' AND policyname = 'Admin access to api_keys'
  ) THEN
    EXECUTE 'DROP POLICY "Admin access to api_keys" ON public.api_keys';
  END IF;
END $$;

-- Ensure RLS is enabled on api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Create a strict single policy for all commands guarded by admin role
CREATE POLICY "Admins can manage api_keys strictly"
ON public.api_keys
FOR ALL
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

-- 2) Add missing DELETE policy for ai_settings (users should manage their own row)
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can delete their own AI settings"
ON public.ai_settings
FOR DELETE
USING (auth.uid() = user_id);

-- 3) Ensure ai_processing_stats has RLS and safe read policy
ALTER TABLE public.ai_processing_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view AI processing stats for their associations"
ON public.ai_processing_stats
FOR SELECT
USING (check_user_association(association_id));

-- 4) Defensive: make sure analytics tables remain scoped (idempotent)
ALTER TABLE IF EXISTS public.analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analytics_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Analytics dashboards association access (strict)"
ON public.analytics_dashboards
FOR ALL
USING (check_user_association(association_id))
WITH CHECK (check_user_association(association_id));

CREATE POLICY IF NOT EXISTS "Analytics metrics association access (strict)"
ON public.analytics_metrics
FOR ALL
USING (check_user_association(association_id))
WITH CHECK (check_user_association(association_id));
