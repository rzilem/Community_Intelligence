
-- Create form_workflows table
CREATE TABLE IF NOT EXISTS public.form_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  formTemplateId UUID NOT NULL REFERENCES public.form_templates(id) ON DELETE CASCADE,
  steps JSONB NOT NULL DEFAULT '[]',
  isEnabled BOOLEAN NOT NULL DEFAULT true,
  logging BOOLEAN DEFAULT false,
  retryFailed BOOLEAN DEFAULT false,
  maxRetries INTEGER DEFAULT 3,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_workflow_execution_logs table
CREATE TABLE IF NOT EXISTS public.form_workflow_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflowId UUID NOT NULL REFERENCES public.form_workflows(id) ON DELETE CASCADE,
  submissionId UUID NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  stepId TEXT NOT NULL,
  actionId TEXT NOT NULL,
  status TEXT NOT NULL,
  details JSONB,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.form_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_workflow_execution_logs ENABLE ROW LEVEL SECURITY;

-- Create workflow execution function
CREATE OR REPLACE FUNCTION public.execute_form_workflow()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be called when a form is submitted
  -- It will check for any workflows associated with the form template
  -- and create workflow execution tasks
  
  INSERT INTO public.form_workflow_execution_logs (
    workflowId,
    submissionId,
    stepId,
    actionId,
    status,
    details,
    createdAt
  )
  SELECT
    fw.id,
    NEW.id,
    'trigger',
    'form_submission',
    'pending',
    jsonb_build_object(
      'form_template_id', NEW.form_template_id,
      'status', NEW.status,
      'submission_data', NEW.form_data
    ),
    now()
  FROM
    public.form_workflows fw
  WHERE
    fw.formTemplateId = NEW.form_template_id
    AND fw.isEnabled = true;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for form submissions
DROP TRIGGER IF EXISTS trigger_execute_form_workflow ON public.form_submissions;
CREATE TRIGGER trigger_execute_form_workflow
AFTER INSERT ON public.form_submissions
FOR EACH ROW
EXECUTE FUNCTION public.execute_form_workflow();

-- Create RLS policies for form workflows
CREATE POLICY "Users can view form workflows"
  ON public.form_workflows
  FOR SELECT
  USING (true);

CREATE POLICY "Administrators can create form workflows"
  ON public.form_workflows
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.role = 'manager')
    )
  );

CREATE POLICY "Administrators can update form workflows"
  ON public.form_workflows
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.role = 'manager')
    )
  );

-- Create RLS policies for workflow execution logs
CREATE POLICY "Administrators can view workflow logs"
  ON public.form_workflow_execution_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.role = 'manager')
    )
  );

CREATE POLICY "System can insert workflow logs"
  ON public.form_workflow_execution_logs
  FOR INSERT
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_form_workflows_template_id ON public.form_workflows(formTemplateId);
CREATE INDEX idx_workflow_logs_workflow_id ON public.form_workflow_execution_logs(workflowId);
CREATE INDEX idx_workflow_logs_submission_id ON public.form_workflow_execution_logs(submissionId);
