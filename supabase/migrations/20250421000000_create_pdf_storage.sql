
-- Create a bucket for storing PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('form-pdfs', 'form-pdfs', false);

-- Allow authenticated users to upload PDFs
CREATE POLICY "Allow authenticated users to upload PDFs"
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'form-pdfs');

-- Allow users to read PDFs from their associations
CREATE POLICY "Allow users to read PDFs from their associations"
ON storage.objects FOR SELECT TO authenticated 
USING (
  bucket_id = 'form-pdfs' AND 
  (storage.foldername(name))[1] IN (
    SELECT association_id::text 
    FROM association_users 
    WHERE user_id = auth.uid()
  )
);
