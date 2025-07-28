-- Drop existing RLS policies that check JWT token
DROP POLICY IF EXISTS "Admin users can manage system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admin users can access system settings" ON public.system_settings;

-- Create a security definer function to get current user's role from profiles table
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- Create new RLS policies that check user role from profiles table
CREATE POLICY "Admin users can select system settings"
ON public.system_settings
FOR SELECT
TO authenticated
USING (public.get_current_user_role() IN ('admin', 'system_admin', 'global_admin'));

CREATE POLICY "Admin users can insert system settings"
ON public.system_settings
FOR INSERT
TO authenticated
WITH CHECK (public.get_current_user_role() IN ('admin', 'system_admin', 'global_admin'));

CREATE POLICY "Admin users can update system settings"
ON public.system_settings
FOR UPDATE
TO authenticated
USING (public.get_current_user_role() IN ('admin', 'system_admin', 'global_admin'))
WITH CHECK (public.get_current_user_role() IN ('admin', 'system_admin', 'global_admin'));

CREATE POLICY "Admin users can delete system settings"
ON public.system_settings
FOR DELETE
TO authenticated
USING (public.get_current_user_role() IN ('admin', 'system_admin', 'global_admin'));