
export interface OnboardingTemplate {
  id: string;
  name: string;
  description?: string;
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
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  completed_at?: string;
  assigned_to?: string;
  notes?: string;
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
