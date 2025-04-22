
-- Create form_submissions table for tracking form submissions
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_template_id UUID NOT NULL REFERENCES public.form_templates(id),
  user_id UUID NOT NULL,
  association_id UUID NOT NULL REFERENCES public.associations(id),
  property_id UUID REFERENCES public.properties(id),
  form_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  tracking_number TEXT,
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for form_submissions
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view their own form submissions"
  ON public.form_submissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own submissions
CREATE POLICY "Users can create their own form submissions"
  ON public.form_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at on form_submissions
CREATE TRIGGER set_updated_at_form_submissions
  BEFORE UPDATE ON public.form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();
