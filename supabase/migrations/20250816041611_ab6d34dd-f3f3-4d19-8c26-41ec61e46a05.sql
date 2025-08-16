-- COMPREHENSIVE SECURITY HARDENING MIGRATION (SYNTAX CORRECTED)
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

-- Separate policies for INSERT, UPDATE, DELETE on associations
CREATE POLICY "Only global admins can insert associations"
ON public.associations
FOR INSERT
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Only global admins can update associations"
ON public.associations
FOR UPDATE
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Only global admins can delete associations"
ON public.associations
FOR DELETE
USING (get_current_user_role() = 'admin');

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