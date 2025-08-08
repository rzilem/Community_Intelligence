-- Accounting foundation migration (phase 1b): fix policies when legacy tables exist
BEGIN;

-- Ensure association_id column exists on bank_transactions if table pre-existed
DO $$
BEGIN
  IF to_regclass('public.bank_transactions') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.bank_transactions ADD COLUMN IF NOT EXISTS association_id uuid';
  END IF;
END$$;

-- Re-attempt RLS policy creation guarded by column existence
DO $$
BEGIN
  -- bank_statement_imports policy
  IF to_regclass('public.bank_statement_imports') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bank_statement_imports' AND policyname='Users can access imports for their associations'
    ) THEN
      EXECUTE 'CREATE POLICY "Users can access imports for their associations" ON public.bank_statement_imports FOR ALL USING (check_user_association(association_id)) WITH CHECK (check_user_association(association_id))';
    END IF;
  END IF;

  -- bank_transactions policy only if column association_id exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='bank_transactions' AND column_name='association_id'
  ) THEN
    -- Enable RLS if not already enabled
    IF NOT EXISTS (
      SELECT 1 FROM pg_tables t
      JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = 'public'::regnamespace
      JOIN pg_namespace n ON n.nspname = t.schemaname
      JOIN pg_class r ON r.oid = c.oid
      JOIN pg_attribute a ON a.attrelid = r.oid AND a.attname = 'association_id'
    ) THEN
      -- no-op guard; proceeding to ensure RLS is on
    END IF;

    -- Ensure RLS enabled
    EXECUTE 'ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bank_transactions' AND policyname='Users can access bank transactions for their associations'
    ) THEN
      EXECUTE 'CREATE POLICY "Users can access bank transactions for their associations" ON public.bank_transactions FOR ALL USING (check_user_association(association_id)) WITH CHECK (check_user_association(association_id))';
    END IF;

    -- Helpful indexes
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_bank_transactions_association_id'
    ) THEN
      EXECUTE 'CREATE INDEX idx_bank_transactions_association_id ON public.bank_transactions (association_id)';
    END IF;
  END IF;
END$$;

COMMIT;