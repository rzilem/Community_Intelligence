-- Lock down invoices storage bucket with RLS and association-scoped policies

-- 1) Ensure RLS is enabled on storage.objects (usually enabled by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2) Make the invoices bucket private
UPDATE storage.buckets
SET public = false
WHERE id = 'invoices';

-- 3) Policies for storage.objects, scoped to invoices bucket
-- SELECT: members of the association can view (and generate signed URLs) for their association's files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Invoices: association members can view objects'
  ) THEN
    CREATE POLICY "Invoices: association members can view objects"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'invoices'
      AND check_user_association((storage.foldername(name))[1]::uuid)
    );
  END IF;
END$$;

-- INSERT: managers/admins in the association can upload into their association folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Invoices: managers can insert objects'
  ) THEN
    CREATE POLICY "Invoices: managers can insert objects"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'invoices'
      AND user_has_association_access((storage.foldername(name))[1]::uuid, 'manager')
    );
  END IF;
END$$;

-- UPDATE: managers/admins in the association can modify their association's files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Invoices: managers can update objects'
  ) THEN
    CREATE POLICY "Invoices: managers can update objects"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'invoices'
      AND user_has_association_access((storage.foldername(name))[1]::uuid, 'manager')
    )
    WITH CHECK (
      bucket_id = 'invoices'
      AND user_has_association_access((storage.foldername(name))[1]::uuid, 'manager')
    );
  END IF;
END$$;

-- DELETE: only admins in the association can delete files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Invoices: admins can delete objects'
  ) THEN
    CREATE POLICY "Invoices: admins can delete objects"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'invoices'
      AND user_has_association_access((storage.foldername(name))[1]::uuid, 'admin')
    );
  END IF;
END$$;