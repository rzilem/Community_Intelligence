
export interface OnboardingTemplate {
  id: string;
  name: string;
  description?: string;
  template_type: 'hoa' | 'condo' | 'onsite-hoa' | 'onsite-condo' | 'offboarding';
  icon?: string;
  estimated_days?: number;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStage {
  id: string;
  template_id: string;
  name: string;
  description?: string;
  order_index: number;
  estimated_days?: number;
  created_at: string;
  updated_at: string;
}

export interface OnboardingTask {
  id: string;
  stage_id: string;
  name: string;
  description?: string;
  order_index: number;
  estimated_days?: number;
  assigned_role?: string;
  task_type: 'client' | 'team';
  created_at: string;
  updated_at: string;
}

export interface OnboardingProject {
  id: string;
  lead_id: string;
  template_id: string;
  name: string;
  start_date: string;
  target_completion_date?: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface OnboardingProjectTask {
  id: string;
  project_id: string;
  template_task_id: string;
  task_name: string;
  stage_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  due_date: string;
  completed_at?: string;
  assigned_to?: string;
  notes?: string;
  task_type: 'client' | 'team';
  created_at: string;
  updated_at: string;
}

export interface OnboardingDocument {
  id: string;
  project_id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}
