-- COMPREHENSIVE SECURITY HARDENING MIGRATION (CORRECTED)
-- Part 1: Critical RLS and Database Security

-- 1) Enable RLS on critical tables missing it
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.associations ENABLE ROW LEVEL SECURITY;

-- 2) Add RLS policies for residents (linked via property_id -> properties -> association_id)
CREATE POLICY "Users can access residents for their associations"
ON public.residents
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM properties p
    JOIN association_users au ON p.association_id = au.association_id
    WHERE p.id = residents.property_id 
    AND au.user_id = auth.uid()
  )
);

-- 3) Add RLS policies for vendors (using hoa_id as association reference)
CREATE POLICY "Users can access vendors for their associations"
ON public.vendors
FOR ALL
USING (
  hoa_id IS NULL OR EXISTS (
    SELECT 1 FROM association_users au
    WHERE au.association_id = vendors.hoa_id
    AND au.user_id = auth.uid()
  )
);

-- 4) Add RLS policies for invoices (check if association_id exists in schema)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'association_id'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can access invoices for their associations"
    ON public.invoices
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM association_users au
        WHERE au.association_id = invoices.association_id
        AND au.user_id = auth.uid()
      )
    )';
  END IF;
END $$;

-- 5) Add RLS policies for associations
CREATE POLICY "Users can view their own associations"
ON public.associations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM association_users
    WHERE association_id = associations.id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Only global admins can manage associations"
ON public.associations
FOR INSERT, UPDATE, DELETE
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 6) Secure storage.objects with association-based RLS
CREATE POLICY "Users can access files for their associations"
ON storage.objects
FOR SELECT
USING (
  bucket_id IN ('association_documents', 'financial_documents', 'maintenance_photos', 'communication_attachments', 'vendor_documents', 'invoices', 'bank_statements', 'bidrequest-attachments') AND
  EXISTS (
    SELECT 1 FROM association_users au
    WHERE au.user_id = auth.uid()
    AND (storage.foldername(name))[1] = au.association_id::text
  )
);

CREATE POLICY "Users can upload files for their associations"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id IN ('association_documents', 'financial_documents', 'maintenance_photos', 'communication_attachments', 'vendor_documents', 'invoices', 'bank_statements', 'bidrequest-attachments') AND
  EXISTS (
    SELECT 1 FROM association_users au
    WHERE au.user_id = auth.uid()
    AND (storage.foldername(name))[1] = au.association_id::text
    AND au.role IN ('admin', 'manager')
  )
);

-- 7) Make sensitive storage buckets private
UPDATE storage.buckets 
SET public = false 
WHERE id IN ('financial_documents', 'maintenance_photos', 'communication_attachments', 'vendor_documents', 'invoices', 'bank_statements', 'bidrequest-attachments');

-- 8) Convert SECURITY DEFINER views to SECURITY INVOKER (check if they exist)
DO $$ 
BEGIN
  -- Check and update trial balance view
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'v_trial_balance') THEN
    DROP VIEW public.v_trial_balance;
    EXECUTE 'CREATE VIEW public.v_trial_balance WITH (security_invoker=true) AS
    SELECT 
      association_id,
      gl_account_code,
      SUM(CASE WHEN transaction_type = ''debit'' THEN amount ELSE -amount END) as balance
    FROM financial_transactions 
    GROUP BY association_id, gl_account_code';
  END IF;

  -- Check and update income statement view
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'v_income_statement') THEN
    DROP VIEW public.v_income_statement;
    EXECUTE 'CREATE VIEW public.v_income_statement WITH (security_invoker=true) AS
    SELECT 
      association_id,
      gl_account_code,
      SUM(amount) as total_amount,
      DATE_TRUNC(''month'', transaction_date) as period
    FROM financial_transactions
    WHERE gl_account_code LIKE ''4%'' OR gl_account_code LIKE ''5%''
    GROUP BY association_id, gl_account_code, DATE_TRUNC(''month'', transaction_date)';
  END IF;

  -- Check and update balance sheet view
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'v_balance_sheet') THEN
    DROP VIEW public.v_balance_sheet;
    EXECUTE 'CREATE VIEW public.v_balance_sheet WITH (security_invoker=true) AS
    SELECT 
      association_id,
      gl_account_code,
      SUM(CASE WHEN transaction_type = ''debit'' THEN amount ELSE -amount END) as balance
    FROM financial_transactions
    WHERE gl_account_code LIKE ''1%'' OR gl_account_code LIKE ''2%'' OR gl_account_code LIKE ''3%''
    GROUP BY association_id, gl_account_code';
  END IF;
END $$;

-- 9) Tighten PUBLIC grants (preserve essential functionality)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;

-- Re-grant necessary authenticated access
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Keep anon access minimal (only for auth flows)
GRANT USAGE ON SCHEMA public TO anon;