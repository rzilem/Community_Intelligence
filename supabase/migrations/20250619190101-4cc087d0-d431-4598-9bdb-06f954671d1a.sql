
-- Fix RLS policies for properties table to allow service role operations
DROP POLICY IF EXISTS "Users can view properties from their associations" ON public.properties;
DROP POLICY IF EXISTS "Users can create properties for their associations" ON public.properties;
DROP POLICY IF EXISTS "Users can update properties from their associations" ON public.properties;
DROP POLICY IF EXISTS "Users can delete properties from their associations" ON public.properties;

-- Create more permissive policies that work with service operations
CREATE POLICY "Users can view properties from their associations" 
ON public.properties 
FOR SELECT 
USING (
  association_id IN (
    SELECT association_id 
    FROM public.association_users 
    WHERE user_id = auth.uid()
  )
  OR auth.role() = 'service_role'
);

CREATE POLICY "Users can create properties for their associations" 
ON public.properties 
FOR INSERT 
WITH CHECK (
  association_id IN (
    SELECT association_id 
    FROM public.association_users 
    WHERE user_id = auth.uid()
  )
  OR auth.role() = 'service_role'
);

CREATE POLICY "Users can update properties from their associations" 
ON public.properties 
FOR UPDATE 
USING (
  association_id IN (
    SELECT association_id 
    FROM public.association_users 
    WHERE user_id = auth.uid()
  )
  OR auth.role() = 'service_role'
);

CREATE POLICY "Users can delete properties from their associations" 
ON public.properties 
FOR DELETE 
USING (
  association_id IN (
    SELECT association_id 
    FROM public.association_users 
    WHERE user_id = auth.uid()
  )
  OR auth.role() = 'service_role'
);

-- Fix RLS policies for residents table
DROP POLICY IF EXISTS "Users can view residents from their associations" ON public.residents;
DROP POLICY IF EXISTS "Users can create residents for their associations" ON public.residents;
DROP POLICY IF EXISTS "Users can update residents from their associations" ON public.residents;
DROP POLICY IF EXISTS "Users can delete residents from their associations" ON public.residents;

CREATE POLICY "Users can view residents from their associations" 
ON public.residents 
FOR SELECT 
USING (
  property_id IN (
    SELECT p.id FROM public.properties p
    JOIN public.association_users au ON p.association_id = au.association_id
    WHERE au.user_id = auth.uid()
  )
  OR auth.role() = 'service_role'
);

CREATE POLICY "Users can create residents for their associations" 
ON public.residents 
FOR INSERT 
WITH CHECK (
  property_id IN (
    SELECT p.id FROM public.properties p
    JOIN public.association_users au ON p.association_id = au.association_id
    WHERE au.user_id = auth.uid()
  )
  OR auth.role() = 'service_role'
);

CREATE POLICY "Users can update residents from their associations" 
ON public.residents 
FOR UPDATE 
USING (
  property_id IN (
    SELECT p.id FROM public.properties p
    JOIN public.association_users au ON p.association_id = au.association_id
    WHERE au.user_id = auth.uid()
  )
  OR auth.role() = 'service_role'
);

CREATE POLICY "Users can delete residents from their associations" 
ON public.residents 
FOR DELETE 
USING (
  property_id IN (
    SELECT p.id FROM public.properties p
    JOIN public.association_users au ON p.association_id = au.association_id
    WHERE au.user_id = auth.uid()
  )
  OR auth.role() = 'service_role'
);

-- Fix RLS policies for documents table
DROP POLICY IF EXISTS "Users can view documents from their associations" ON public.documents;
DROP POLICY IF EXISTS "Users can create documents for their associations" ON public.documents;
DROP POLICY IF EXISTS "Users can update documents from their associations" ON public.documents;
DROP POLICY IF EXISTS "Users can delete documents from their associations" ON public.documents;

CREATE POLICY "Users can view documents from their associations" 
ON public.documents 
FOR SELECT 
USING (
  association_id IN (
    SELECT association_id 
    FROM public.association_users 
    WHERE user_id = auth.uid()
  )
  OR auth.role() = 'service_role'
);

CREATE POLICY "Users can create documents for their associations" 
ON public.documents 
FOR INSERT 
WITH CHECK (
  association_id IN (
    SELECT association_id 
    FROM public.association_users 
    WHERE user_id = auth.uid()
  )
  OR auth.role() = 'service_role'
);

CREATE POLICY "Users can update documents from their associations" 
ON public.documents 
FOR UPDATE 
USING (
  association_id IN (
    SELECT association_id 
    FROM public.association_users 
    WHERE user_id = auth.uid()
  )
  OR auth.role() = 'service_role'
);

CREATE POLICY "Users can delete documents from their associations" 
ON public.documents 
FOR DELETE 
USING (
  association_id IN (
    SELECT association_id 
    FROM public.association_users 
    WHERE user_id = auth.uid()
  )
  OR auth.role() = 'service_role'
);

-- Create import_jobs table if it doesn't exist for tracking import operations
CREATE TABLE IF NOT EXISTS public.import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id uuid NOT NULL REFERENCES public.associations(id),
  import_type text NOT NULL,
  status text NOT NULL DEFAULT 'processing',
  file_name text,
  file_size integer,
  rows_processed integer DEFAULT 0,
  rows_succeeded integer DEFAULT 0,
  rows_failed integer DEFAULT 0,
  error_details jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on import_jobs
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for import_jobs
CREATE POLICY "Users can view import jobs from their associations" 
ON public.import_jobs 
FOR SELECT 
USING (
  association_id IN (
    SELECT association_id 
    FROM public.association_users 
    WHERE user_id = auth.uid()
  )
  OR auth.role() = 'service_role'
);

CREATE POLICY "Users can create import jobs for their associations" 
ON public.import_jobs 
FOR INSERT 
WITH CHECK (
  association_id IN (
    SELECT association_id 
    FROM public.association_users 
    WHERE user_id = auth.uid()
  )
  OR auth.role() = 'service_role'
);

CREATE POLICY "Users can update import jobs from their associations" 
ON public.import_jobs 
FOR UPDATE 
USING (
  association_id IN (
    SELECT association_id 
    FROM public.association_users 
    WHERE user_id = auth.uid()
  )
  OR auth.role() = 'service_role'
);

-- Add trigger for updated_at on import_jobs
CREATE OR REPLACE FUNCTION public.update_import_jobs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_import_jobs_updated_at ON public.import_jobs;
CREATE TRIGGER update_import_jobs_updated_at
  BEFORE UPDATE ON public.import_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_import_jobs_updated_at();
