-- Create function to get form workflows
CREATE OR REPLACE FUNCTION public.get_form_workflows(template_id UUID)
RETURNS SETOF public.form_workflows
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.form_workflows 
  WHERE formTemplateId = template_id
  AND isEnabled = true
  ORDER BY createdAt;
$$;

-- Create function to log workflow execution
CREATE OR REPLACE FUNCTION public.log_workflow_execution(
  p_workflow_id UUID,
  p_submission_id UUID,
  p_step_id TEXT,
  p_action_id TEXT,
  p_status TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.form_workflow_execution_logs (
    workflowId,
    submissionId,
    stepId,
    actionId,
    status,
    details,
    createdAt
  ) VALUES (
    p_workflow_id,
    p_submission_id,
    p_step_id,
    p_action_id,
    p_status,
    p_details,
    now()
  );
END;
$$;

