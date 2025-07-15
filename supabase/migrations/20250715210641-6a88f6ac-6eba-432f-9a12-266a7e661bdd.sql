-- Fix infinite recursion in association_users RLS policies
-- Step 1: Drop all existing policies that are causing recursion
DROP POLICY IF EXISTS "Allow admins to view all association memberships" ON association_users;
DROP POLICY IF EXISTS "Allow authenticated users to delete association_users" ON association_users;
DROP POLICY IF EXISTS "Allow authenticated users to insert association_users" ON association_users;
DROP POLICY IF EXISTS "Allow authenticated users to update association_users" ON association_users;
DROP POLICY IF EXISTS "Allow authenticated users to view their associations" ON association_users;
DROP POLICY IF EXISTS "Allow users to view their own association memberships" ON association_users;
DROP POLICY IF EXISTS "Association admins can add users" ON association_users;
DROP POLICY IF EXISTS "Association admins can manage memberships" ON association_users;
DROP POLICY IF EXISTS "Association admins can remove users" ON association_users;
DROP POLICY IF EXISTS "Association admins can update user roles" ON association_users;
DROP POLICY IF EXISTS "Association creators can manage associations" ON association_users;
DROP POLICY IF EXISTS "Only admins can delete association memberships" ON association_users;
DROP POLICY IF EXISTS "Only admins can manage association memberships" ON association_users;
DROP POLICY IF EXISTS "Only admins can update association memberships" ON association_users;
DROP POLICY IF EXISTS "Users can view their own association memberships" ON association_users;
DROP POLICY IF EXISTS "Users can view their own memberships" ON association_users;

-- Step 2: Create security definer function to check admin role without recursion
CREATE OR REPLACE FUNCTION public.check_association_admin(association_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Direct query without RLS to avoid recursion
  SELECT role INTO user_role 
  FROM public.association_users 
  WHERE association_id = association_uuid 
    AND user_id = auth.uid();
  
  RETURN user_role = 'admin';
END;
$$;

-- Step 3: Create simple, non-recursive RLS policies
CREATE POLICY "Users can view their own memberships"
ON association_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own memberships"
ON association_users
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Association admins can view all memberships"
ON association_users
FOR SELECT
TO authenticated
USING (public.check_association_admin(association_id));

CREATE POLICY "Association admins can manage all memberships"
ON association_users
FOR ALL
TO authenticated
USING (public.check_association_admin(association_id))
WITH CHECK (public.check_association_admin(association_id));