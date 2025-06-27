
-- Create table to track homeowner request responses
CREATE TABLE public.homeowner_request_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.homeowner_requests(id) ON DELETE CASCADE,
  response_content TEXT NOT NULL,
  response_method TEXT NOT NULL DEFAULT 'email',
  sent_to TEXT NOT NULL,
  sent_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.homeowner_request_responses ENABLE ROW LEVEL SECURITY;

-- Policy for viewing responses (users can see responses for requests they have access to)
CREATE POLICY "Users can view responses for accessible requests" 
  ON public.homeowner_request_responses 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.homeowner_requests hr
      JOIN public.association_users au ON hr.association_id = au.association_id
      WHERE hr.id = homeowner_request_responses.request_id
      AND au.user_id = auth.uid()
    )
  );

-- Policy for creating responses
CREATE POLICY "Users can create responses for accessible requests" 
  ON public.homeowner_request_responses 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.homeowner_requests hr
      JOIN public.association_users au ON hr.association_id = au.association_id
      WHERE hr.id = homeowner_request_responses.request_id
      AND au.user_id = auth.uid()
    )
  );
