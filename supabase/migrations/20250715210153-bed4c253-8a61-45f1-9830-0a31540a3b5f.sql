-- Phase 1: Enable RLS on tables that don't have it enabled
DO $$
BEGIN
    -- Only enable RLS if not already enabled
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'association_users' AND rowsecurity = true) THEN
        ALTER TABLE association_users ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS on other tables
    ALTER TABLE account_credits ENABLE ROW LEVEL SECURITY;
    ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;
    ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;
    ALTER TABLE assessment_types_enhanced ENABLE ROW LEVEL SECURITY;
END $$;

-- Phase 2: Create or replace RLS policies (drop existing ones first)
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can access account credits for their associations" ON account_credits;
    DROP POLICY IF EXISTS "Users can access accounts payable for their associations" ON accounts_payable;
    DROP POLICY IF EXISTS "Users can access accounts receivable for their associations" ON accounts_receivable;
    DROP POLICY IF EXISTS "Users can access assessment types enhanced for their associations" ON assessment_types_enhanced;
    
    -- Create new policies
    CREATE POLICY "Users can access account credits for their associations" ON account_credits
      FOR ALL USING (check_user_association(association_id));

    CREATE POLICY "Users can access accounts payable for their associations" ON accounts_payable
      FOR ALL USING (check_user_association(association_id));

    CREATE POLICY "Users can access accounts receivable for their associations" ON accounts_receivable
      FOR ALL USING (check_user_association(association_id));

    CREATE POLICY "Users can access assessment types enhanced for their associations" ON assessment_types_enhanced
      FOR ALL USING (check_user_association(association_id));
END $$;

-- Phase 3: Fix search_path on key trigger functions to prevent schema injection
CREATE OR REPLACE FUNCTION public.update_user_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_timestamp_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_aging_days()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.aging_days = GREATEST(0, EXTRACT(days FROM CURRENT_DATE - NEW.due_date));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_residents_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_communications_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;