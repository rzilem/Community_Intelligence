-- CRITICAL SECURITY FIX: Enable RLS and create policies for unprotected tables

-- Enable RLS on all unprotected tables
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for association-based access

-- Announcements: Association members can view, admins can manage
CREATE POLICY "Users can view announcements for their associations"
ON public.announcements FOR SELECT
USING (check_user_association(association_id));

CREATE POLICY "Admins can manage announcements"
ON public.announcements FOR ALL
USING (user_has_association_access(association_id, 'admin'::text))
WITH CHECK (user_has_association_access(association_id, 'admin'::text));

-- Assessments: Property-based access control
CREATE POLICY "Users can view assessments for their properties"
ON public.assessments FOR SELECT
USING (property_id IN (
  SELECT p.id FROM properties p
  JOIN association_users au ON p.association_id = au.association_id
  WHERE au.user_id = auth.uid()
));

CREATE POLICY "Admins can manage assessments"
ON public.assessments FOR ALL
USING (property_id IN (
  SELECT p.id FROM properties p
  JOIN association_users au ON p.association_id = au.association_id
  WHERE au.user_id = auth.uid() AND au.role IN ('admin', 'manager')
))
WITH CHECK (property_id IN (
  SELECT p.id FROM properties p
  JOIN association_users au ON p.association_id = au.association_id
  WHERE au.user_id = auth.uid() AND au.role IN ('admin', 'manager')
));

-- API Usage Logs: Admin-only access
CREATE POLICY "Only admins can view API usage logs"
ON public.api_usage_logs FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role = 'admin'::user_role
));

-- Fix Security Definer functions with proper search_path
CREATE OR REPLACE FUNCTION public.check_user_association(association_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.association_users 
    WHERE association_id = association_uuid 
    AND user_id = auth.uid()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.user_has_association_access(association_uuid uuid, min_role text DEFAULT 'member'::text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.association_users 
  WHERE association_id = association_uuid AND user_id = auth.uid();
  
  IF user_role IS NULL THEN
    RETURN FALSE;
  ELSIF min_role = 'member' THEN
    RETURN TRUE;
  ELSIF min_role = 'manager' AND user_role IN ('manager', 'admin') THEN
    RETURN TRUE;
  ELSIF min_role = 'admin' AND user_role = 'admin' THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$function$;

-- Create secure HMAC validation function
CREATE OR REPLACE FUNCTION public.validate_webhook_signature(
  payload text,
  signature text,
  secret text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  expected_signature text;
BEGIN
  -- Use proper HMAC-SHA256 validation
  expected_signature := 'sha256=' || encode(
    hmac(payload::bytea, secret::bytea, 'sha256'), 
    'hex'
  );
  
  -- Constant-time comparison to prevent timing attacks
  RETURN expected_signature = signature;
END;
$function$;