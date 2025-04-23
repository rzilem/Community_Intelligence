
-- Create a table to store document analyses
CREATE TABLE IF NOT EXISTS public.document_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_url TEXT NOT NULL,
  document_name TEXT,
  document_type TEXT,
  analysis_results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies to restrict access to document analyses
ALTER TABLE public.document_analyses ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to view document analyses
CREATE POLICY "Users can view document analyses" 
  ON public.document_analyses 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to create document analyses
CREATE POLICY "Users can create document analyses" 
  ON public.document_analyses 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Add trigger to update the updated_at column
CREATE TRIGGER set_document_analyses_updated_at
BEFORE UPDATE ON public.document_analyses
FOR EACH ROW
EXECUTE PROCEDURE public.update_timestamp_column();
