-- Accounting Views Migration (fixed quoting)
BEGIN;

-- v_trial_balance
DO $$
BEGIN
  IF to_regclass('public.accounts_receivable') IS NOT NULL AND to_regclass('public.accounts_payable') IS NOT NULL THEN
    EXECUTE $vb$
      CREATE OR REPLACE VIEW public.v_trial_balance AS
      WITH ar AS (
        SELECT association_id, COALESCE(SUM(current_balance),0)::numeric AS ar_balance
        FROM public.accounts_receivable
        GROUP BY association_id
      ),
      ap AS (
        SELECT association_id, COALESCE(SUM(current_balance),0)::numeric AS ap_balance
        FROM public.accounts_payable
        GROUP BY association_id
      )
      SELECT 
        a.association_id,
        'AR'::text AS account_code,
        'Accounts Receivable'::text AS account_name,
        GREATEST(a.ar_balance,0)::numeric AS debit,
        GREATEST(-a.ar_balance,0)::numeric AS credit,
        a.ar_balance::numeric AS balance,
        CURRENT_DATE AS as_of_date
      FROM ar a
      UNION ALL
      SELECT 
        p.association_id,
        'AP'::text AS account_code,
        'Accounts Payable'::text AS account_name,
        GREATEST(p.ap_balance,0)::numeric AS debit,
        GREATEST(-p.ap_balance,0)::numeric AS credit,
        p.ap_balance::numeric AS balance,
        CURRENT_DATE AS as_of_date
      FROM ap p;
    $vb$;
  ELSE
    EXECUTE $vb$
      CREATE OR REPLACE VIEW public.v_trial_balance AS
      SELECT 
        NULL::uuid AS association_id,
        NULL::text AS account_code,
        NULL::text AS account_name,
        0::numeric AS debit,
        0::numeric AS credit,
        0::numeric AS balance,
        CURRENT_DATE AS as_of_date
      WHERE false;
    $vb$;
  END IF;
END$$;

-- v_income_statement
DO $$
BEGIN
  IF to_regclass('public.assessments') IS NOT NULL AND to_regclass('public.accounts_payable') IS NOT NULL THEN
    EXECUTE $vi$
      CREATE OR REPLACE VIEW public.v_income_statement AS
      WITH revenue AS (
        SELECT p.association_id, COALESCE(SUM(a.amount),0)::numeric AS revenue_total
        FROM public.assessments a
        JOIN public.properties p ON p.id = a.property_id
        GROUP BY p.association_id
      ),
      expenses AS (
        SELECT association_id, COALESCE(SUM(paid_amount),0)::numeric AS expense_total
        FROM public.accounts_payable
        GROUP BY association_id
      )
      SELECT 
        COALESCE(r.association_id, e.association_id) AS association_id,
        COALESCE(r.revenue_total, 0)::numeric AS revenue_total,
        COALESCE(e.expense_total, 0)::numeric AS expense_total,
        (COALESCE(r.revenue_total, 0) - COALESCE(e.expense_total, 0))::numeric AS net_income,
        CURRENT_DATE AS as_of_date
      FROM revenue r
      FULL OUTER JOIN expenses e ON e.association_id = r.association_id;
    $vi$;
  ELSE
    EXECUTE $vi$
      CREATE OR REPLACE VIEW public.v_income_statement AS
      SELECT 
        NULL::uuid AS association_id,
        0::numeric AS revenue_total,
        0::numeric AS expense_total,
        0::numeric AS net_income,
        CURRENT_DATE AS as_of_date
      WHERE false;
    $vi$;
  END IF;
END$$;

-- v_balance_sheet
DO $$
BEGIN
  IF to_regclass('public.accounts_receivable') IS NOT NULL AND to_regclass('public.accounts_payable') IS NOT NULL THEN
    EXECUTE $vb$
      CREATE OR REPLACE VIEW public.v_balance_sheet AS
      WITH ar AS (
        SELECT association_id, COALESCE(SUM(current_balance),0)::numeric AS assets_total
        FROM public.accounts_receivable
        GROUP BY association_id
      ),
      ap AS (
        SELECT association_id, COALESCE(SUM(current_balance),0)::numeric AS liabilities_total
        FROM public.accounts_payable
        GROUP BY association_id
      )
      SELECT 
        COALESCE(ar.association_id, ap.association_id) AS association_id,
        COALESCE(ar.assets_total, 0)::numeric AS assets_total,
        COALESCE(ap.liabilities_total, 0)::numeric AS liabilities_total,
        (COALESCE(ar.assets_total, 0) - COALESCE(ap.liabilities_total, 0))::numeric AS equity_total,
        CURRENT_DATE AS as_of_date
      FROM ar
      FULL OUTER JOIN ap ON ap.association_id = ar.association_id;
    $vb$;
  ELSE
    EXECUTE $vb$
      CREATE OR REPLACE VIEW public.v_balance_sheet AS
      SELECT 
        NULL::uuid AS association_id,
        0::numeric AS assets_total,
        0::numeric AS liabilities_total,
        0::numeric AS equity_total,
        CURRENT_DATE AS as_of_date
      WHERE false;
    $vb$;
  END IF;
END$$;

COMMIT;