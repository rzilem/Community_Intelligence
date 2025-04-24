
export type WorkflowType = 
  | 'Financial' 
  | 'Compliance' 
  | 'Maintenance' 
  | 'Resident Management' 
  | 'Governance' 
  | 'Communication';

export type WorkflowStatus = 'active' | 'draft' | 'inactive' | 'template' | 'completed' | 'archived';

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  order: number;
  isComplete?: boolean;
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
  [key: string]: any; // Add index signature to make compatible with JSON
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  type: WorkflowType;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  is_template: boolean;
  isPopular?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  assigned_to?: string;
  due_date?: string;
  completion_date?: string;
  association_id?: string;
}
