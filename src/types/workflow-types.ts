
export type WorkflowType = 
  | 'Financial' 
  | 'Compliance' 
  | 'Maintenance' 
  | 'Resident Management' 
  | 'Governance' 
  | 'Communication';

export type WorkflowStatus = 'active' | 'draft' | 'inactive' | 'template';

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  order: number;
  isComplete?: boolean;
  [key: string]: any; // Add index signature to make compatible with JSON
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  type: WorkflowType;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  isTemplate: boolean;
  isPopular?: boolean;
}
