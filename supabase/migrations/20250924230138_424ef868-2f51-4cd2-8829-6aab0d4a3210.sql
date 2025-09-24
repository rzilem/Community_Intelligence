-- Fix RLS infinite recursion on profiles table
-- Create security definer function to safely get user role without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop the problematic admin policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

-- Create new admin policy using the security definer function
CREATE POLICY "Admins can read all profiles" ON public.profiles
FOR SELECT USING (public.get_current_user_role() = 'admin');