
-- First, let's update the RLS policies for the system_settings table
ALTER TABLE IF EXISTS public.system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow admins to read system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow admins to insert system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow admins to update system settings" ON public.system_settings;

-- Create new policies that allow users with admin role to read/write system settings
CREATE POLICY "Allow admins to read system settings" 
  ON public.system_settings 
  FOR SELECT 
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Allow admins to insert system settings" 
  ON public.system_settings 
  FOR INSERT 
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Allow admins to update system settings" 
  ON public.system_settings 
  FOR UPDATE 
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
