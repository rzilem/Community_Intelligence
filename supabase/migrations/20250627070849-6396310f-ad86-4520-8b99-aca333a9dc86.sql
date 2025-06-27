
-- Create proper RLS policies for the invoices storage bucket
CREATE POLICY "Allow authenticated users to view invoices"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'invoices');

CREATE POLICY "Allow authenticated users to upload invoices"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invoices');

CREATE POLICY "Allow authenticated users to update invoices"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'invoices');

CREATE POLICY "Allow authenticated users to delete invoices" 
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'invoices');

-- Ensure the invoices bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO UPDATE SET public = true;
