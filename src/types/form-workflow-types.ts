
export type FormWorkflowTrigger = 
  | 'on_submit'
  | 'on_approval'
  | 'on_rejection'
  | 'on_status_change';

export type FormWorkflowActionType = 
  | 'send_email'
  | 'send_notification'
  | 'create_request'
  | 'update_property'
  | 'assign_task'
  | 'update_status'
  | 'webhook';

export interface FormWorkflowAction {
  id: string;
  type: FormWorkflowActionType;
  name: string;
  config: Record<string, any>;
  order: number;
}

export interface FormWorkflowCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number | boolean;
  customField?: string; // Added for custom field support
}

export interface FormWorkflowStep {
  id: string;
  name: string;
  description?: string;
  trigger: FormWorkflowTrigger;
  conditions: FormWorkflowCondition[];
  actions: FormWorkflowAction[];
  isEnabled: boolean;
}

export interface FormWorkflow {
  id: string;
  name: string;
  description?: string;
  formTemplateId: string;
  steps: FormWorkflowStep[];
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  logging?: boolean; // Added for workflow logging option
  retryFailed?: boolean; // Added for retry failed actions
  maxRetries?: number; // Added for max retries setting
}

export interface FormWorkflowExecutionLog {
  id: string;
  workflowId: string;
  submissionId: string;
  stepId: string;
  actionId: string;
  status: 'success' | 'failed' | 'pending';
  details?: Record<string, any>;
  createdAt: string;
}
