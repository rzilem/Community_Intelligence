
-- Create a bucket for storing PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload PDFs
CREATE POLICY "Allow authenticated users to upload PDFs"
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'invoices')
ON CONFLICT DO NOTHING;

-- Allow anyone to read PDFs in the invoices bucket (since they're public)
CREATE POLICY "Allow anyone to read PDFs"
ON storage.objects FOR SELECT TO anon 
USING (bucket_id = 'invoices')
ON CONFLICT DO NOTHING;
