-- Accounting foundation migration (phase 1a): schema alignment and bank import tables (without views)
BEGIN;

-- 1) Extend three_way_matches if it exists
DO $$
BEGIN
  IF to_regclass('public.three_way_matches') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.three_way_matches ADD COLUMN IF NOT EXISTS confidence_score numeric';
    EXECUTE 'ALTER TABLE public.three_way_matches ADD COLUMN IF NOT EXISTS exceptions_data jsonb';
    EXECUTE 'ALTER TABLE public.three_way_matches ADD COLUMN IF NOT EXISTS requires_approval boolean DEFAULT false';
    EXECUTE 'ALTER TABLE public.three_way_matches ADD COLUMN IF NOT EXISTS auto_approved boolean DEFAULT false';
    EXECUTE 'ALTER TABLE public.three_way_matches ADD COLUMN IF NOT EXISTS approved_by uuid';
    EXECUTE 'ALTER TABLE public.three_way_matches ADD COLUMN IF NOT EXISTS approved_at timestamptz';
    EXECUTE 'ALTER TABLE public.three_way_matches ADD COLUMN IF NOT EXISTS override_reason text';
    EXECUTE 'ALTER TABLE public.three_way_matches ADD COLUMN IF NOT EXISTS rejection_reason text';

    PERFORM 1 FROM pg_indexes WHERE schemaname='public' AND tablename='three_way_matches' AND indexname='three_way_matches_requires_approval_idx';
    IF NOT FOUND THEN
      EXECUTE 'CREATE INDEX three_way_matches_requires_approval_idx ON public.three_way_matches (requires_approval)';
    END IF;
  END IF;
END$$;

-- 2) Bank statement import pipeline tables
CREATE TABLE IF NOT EXISTS public.bank_statement_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id uuid NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  import_date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  total_rows integer NOT NULL DEFAULT 0,
  parsed_rows integer NOT NULL DEFAULT 0,
  matched_rows integer NOT NULL DEFAULT 0,
  error_message text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id uuid NOT NULL,
  import_id uuid REFERENCES public.bank_statement_imports(id) ON DELETE SET NULL,
  bank_account_id uuid,
  transaction_date date NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  type text,
  fit_id text,
  match_status text NOT NULL DEFAULT 'unmatched',
  matched_entry_id uuid,
  matched_line_id uuid,
  match_confidence numeric,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bank_statement_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies using existing helper
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bank_statement_imports' AND policyname='Users can access imports for their associations'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can access imports for their associations" ON public.bank_statement_imports FOR ALL USING (check_user_association(association_id)) WITH CHECK (check_user_association(association_id))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bank_transactions' AND policyname='Users can access bank transactions for their associations'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can access bank transactions for their associations" ON public.bank_transactions FOR ALL USING (check_user_association(association_id)) WITH CHECK (check_user_association(association_id))';
  END IF;
END$$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS bank_statement_imports_association_id_idx ON public.bank_statement_imports (association_id);
CREATE INDEX IF NOT EXISTS bank_transactions_association_id_idx ON public.bank_transactions (association_id);
CREATE INDEX IF NOT EXISTS bank_transactions_date_idx ON public.bank_transactions (transaction_date);
CREATE INDEX IF NOT EXISTS bank_transactions_fit_id_idx ON public.bank_transactions (fit_id);
CREATE INDEX IF NOT EXISTS bank_transactions_match_status_idx ON public.bank_transactions (match_status);

-- Updated_at triggers (reuse existing helper if present)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column' AND pg_function_is_visible(oid)
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid WHERE c.relname = 'bank_statement_imports' AND t.tgname = 'trg_bank_statement_imports_updated_at'
    ) THEN
      EXECUTE 'DROP TRIGGER trg_bank_statement_imports_updated_at ON public.bank_statement_imports';
    END IF;
    IF EXISTS (
      SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid WHERE c.relname = 'bank_transactions' AND t.tgname = 'trg_bank_transactions_updated_at'
    ) THEN
      EXECUTE 'DROP TRIGGER trg_bank_transactions_updated_at ON public.bank_transactions';
    END IF;

    EXECUTE 'CREATE TRIGGER trg_bank_statement_imports_updated_at BEFORE UPDATE ON public.bank_statement_imports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()';
    EXECUTE 'CREATE TRIGGER trg_bank_transactions_updated_at BEFORE UPDATE ON public.bank_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()';
  END IF;
END$$;

COMMIT;