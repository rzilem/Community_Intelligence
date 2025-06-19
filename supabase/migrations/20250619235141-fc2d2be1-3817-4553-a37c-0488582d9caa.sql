
-- Fix RLS policies for document imports and add enhanced error handling

-- First, let's create a function to automatically assign users to associations they create during import
CREATE OR REPLACE FUNCTION public.auto_assign_user_to_association()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Automatically assign the creating user as admin of the new association
  INSERT INTO public.association_users (association_id, user_id, role)
  VALUES (NEW.id, auth.uid(), 'admin')
  ON CONFLICT (association_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign users to associations they create
DROP TRIGGER IF EXISTS auto_assign_association_admin ON public.associations;
CREATE TRIGGER auto_assign_association_admin
  AFTER INSERT ON public.associations
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_user_to_association();

-- Improve document storage error handling with better file size limits
CREATE OR REPLACE FUNCTION public.validate_document_upload(
  file_size_bytes bigint,
  file_type text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  max_size_mb constant integer := 500; -- Increased from 300MB to 500MB
  max_size_bytes constant bigint := max_size_mb * 1024 * 1024;
  result jsonb;
BEGIN
  -- Check file size
  IF file_size_bytes > max_size_bytes THEN
    result := jsonb_build_object(
      'valid', false,
      'error', 'file_too_large',
      'message', format('File size (%s MB) exceeds maximum allowed size of %s MB', 
                       round(file_size_bytes::numeric / 1024 / 1024, 2), max_size_mb),
      'max_size_mb', max_size_mb,
      'file_size_mb', round(file_size_bytes::numeric / 1024 / 1024, 2)
    );
  ELSE
    result := jsonb_build_object(
      'valid', true,
      'message', 'File size acceptable',
      'file_size_mb', round(file_size_bytes::numeric / 1024 / 1024, 2)
    );
  END IF;
  
  RETURN result;
END;
$$;

-- Create enhanced import progress tracking table
CREATE TABLE IF NOT EXISTS public.document_import_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  association_id uuid REFERENCES public.associations(id),
  user_id uuid REFERENCES auth.users(id),
  total_files integer DEFAULT 0,
  processed_files integer DEFAULT 0,
  successful_imports integer DEFAULT 0,
  failed_imports integer DEFAULT 0,
  created_properties integer DEFAULT 0,
  current_stage text DEFAULT 'initializing',
  stage_progress numeric DEFAULT 0,
  error_details jsonb DEFAULT '[]'::jsonb,
  warnings jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Enable RLS on import progress table
ALTER TABLE public.document_import_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for import progress
CREATE POLICY "Users can view their own import progress" 
ON public.document_import_progress 
FOR SELECT 
USING (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "Users can create their own import progress" 
ON public.document_import_progress 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own import progress" 
ON public.document_import_progress 
FOR UPDATE 
USING (user_id = auth.uid() OR auth.role() = 'service_role');

-- Add trigger for updated_at on import progress
CREATE OR REPLACE FUNCTION public.update_document_import_progress_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_document_import_progress_updated_at ON public.document_import_progress;
CREATE TRIGGER update_document_import_progress_updated_at
  BEFORE UPDATE ON public.document_import_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_document_import_progress_updated_at();

-- Create function to handle bulk document import with enhanced error handling
CREATE OR REPLACE FUNCTION public.bulk_import_documents(
  p_documents jsonb,
  p_association_id uuid,
  p_session_id text DEFAULT gen_random_uuid()::text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  doc_record jsonb;
  import_result jsonb;
  success_count integer := 0;
  error_count integer := 0;
  errors jsonb := '[]'::jsonb;
  warnings jsonb := '[]'::jsonb;
BEGIN
  -- Verify user has access to association
  IF NOT EXISTS (
    SELECT 1 FROM public.association_users 
    WHERE association_id = p_association_id AND user_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'access_denied',
      'message', 'User does not have access to this association'
    );
  END IF;

  -- Process each document
  FOR doc_record IN SELECT * FROM jsonb_array_elements(p_documents)
  LOOP
    BEGIN
      -- Insert document with proper error handling
      INSERT INTO public.documents (
        association_id,
        property_id,
        name,
        url,
        file_type,
        file_size,
        description,
        category,
        document_type,
        folder_path,
        uploaded_by
      ) VALUES (
        p_association_id,
        (doc_record->>'property_id')::uuid,
        doc_record->>'name',
        doc_record->>'url',
        doc_record->>'file_type',
        (doc_record->>'file_size')::integer,
        doc_record->>'description',
        doc_record->>'category',
        doc_record->>'document_type',
        doc_record->>'folder_path',
        auth.uid()
      );
      
      success_count := success_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      errors := errors || jsonb_build_object(
        'document', doc_record->>'name',
        'error', SQLERRM,
        'sqlstate', SQLSTATE
      );
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'success', success_count > 0,
    'successful_imports', success_count,
    'failed_imports', error_count,
    'total_processed', success_count + error_count,
    'errors', errors,
    'warnings', warnings,
    'session_id', p_session_id
  );
END;
$$;
