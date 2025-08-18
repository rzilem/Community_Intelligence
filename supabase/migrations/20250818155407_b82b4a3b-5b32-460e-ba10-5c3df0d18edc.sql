-- Create vendor workflow automation tables
CREATE TABLE public.vendor_workflow_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('compliance_due', 'contract_expiry', 'performance_threshold', 'manual', 'vendor_status_change', 'invoice_received')),
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.vendor_workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id UUID NOT NULL REFERENCES public.vendor_workflow_automations(id) ON DELETE CASCADE,
  vendor_id UUID,
  association_id UUID NOT NULL,
  trigger_data JSONB NOT NULL DEFAULT '{}',
  execution_status TEXT NOT NULL DEFAULT 'pending' CHECK (execution_status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  result JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.vendor_workflow_action_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID NOT NULL REFERENCES public.vendor_workflow_executions(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  result JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_workflow_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_workflow_action_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_workflow_automations
CREATE POLICY "Users can view workflow automations for their associations"
ON public.vendor_workflow_automations
FOR SELECT
USING (check_user_association(association_id));

CREATE POLICY "Managers can create workflow automations"
ON public.vendor_workflow_automations
FOR INSERT
WITH CHECK (user_has_association_access(association_id, 'manager'));

CREATE POLICY "Managers can update workflow automations"
ON public.vendor_workflow_automations
FOR UPDATE
USING (user_has_association_access(association_id, 'manager'))
WITH CHECK (user_has_association_access(association_id, 'manager'));

CREATE POLICY "Admins can delete workflow automations"
ON public.vendor_workflow_automations
FOR DELETE
USING (user_has_association_access(association_id, 'admin'));

-- RLS Policies for vendor_workflow_executions
CREATE POLICY "Users can view workflow executions for their associations"
ON public.vendor_workflow_executions
FOR SELECT
USING (check_user_association(association_id));

CREATE POLICY "Managers can create workflow executions"
ON public.vendor_workflow_executions
FOR INSERT
WITH CHECK (user_has_association_access(association_id, 'manager'));

CREATE POLICY "System can update workflow executions"
ON public.vendor_workflow_executions
FOR UPDATE
USING (check_user_association(association_id));

-- RLS Policies for vendor_workflow_action_logs
CREATE POLICY "Users can view workflow action logs for their associations"
ON public.vendor_workflow_action_logs
FOR SELECT
USING (execution_id IN (
  SELECT id FROM public.vendor_workflow_executions 
  WHERE check_user_association(association_id)
));

CREATE POLICY "System can create workflow action logs"
ON public.vendor_workflow_action_logs
FOR INSERT
WITH CHECK (execution_id IN (
  SELECT id FROM public.vendor_workflow_executions 
  WHERE check_user_association(association_id)
));

CREATE POLICY "System can update workflow action logs"
ON public.vendor_workflow_action_logs
FOR UPDATE
USING (execution_id IN (
  SELECT id FROM public.vendor_workflow_executions 
  WHERE check_user_association(association_id)
));

-- Indexes for performance
CREATE INDEX idx_vendor_workflow_automations_association_id ON public.vendor_workflow_automations(association_id);
CREATE INDEX idx_vendor_workflow_automations_is_active ON public.vendor_workflow_automations(is_active);
CREATE INDEX idx_vendor_workflow_automations_trigger_type ON public.vendor_workflow_automations(trigger_type);

CREATE INDEX idx_vendor_workflow_executions_automation_id ON public.vendor_workflow_executions(automation_id);
CREATE INDEX idx_vendor_workflow_executions_vendor_id ON public.vendor_workflow_executions(vendor_id);
CREATE INDEX idx_vendor_workflow_executions_association_id ON public.vendor_workflow_executions(association_id);
CREATE INDEX idx_vendor_workflow_executions_status ON public.vendor_workflow_executions(execution_status);
CREATE INDEX idx_vendor_workflow_executions_created_at ON public.vendor_workflow_executions(created_at);

CREATE INDEX idx_vendor_workflow_action_logs_execution_id ON public.vendor_workflow_action_logs(execution_id);
CREATE INDEX idx_vendor_workflow_action_logs_status ON public.vendor_workflow_action_logs(status);

-- Updated_at triggers
CREATE TRIGGER update_vendor_workflow_automations_updated_at
  BEFORE UPDATE ON public.vendor_workflow_automations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_vendor_workflow_executions_updated_at
  BEFORE UPDATE ON public.vendor_workflow_executions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();