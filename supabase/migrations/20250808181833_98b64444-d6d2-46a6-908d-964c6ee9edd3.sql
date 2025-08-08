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
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bank_transactions' AND policyname='Users can access bank transactions for their associations'
    ) THEN
      EXECUTE 'CREATE POLICY "Users can access bank transactions for their associations" ON public.bank_transactions FOR ALL USING (check_user_association(association_id)) WITH CHECK (check_user_association(association_id))';
    END IF;
  END IF;
END$$;

COMMIT;