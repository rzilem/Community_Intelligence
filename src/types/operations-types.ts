
export type WorkflowScheduleType = 'payment' | 'file' | 'report' | 'sync' | 'maintenance' | 'notification';
export type WorkflowScheduleStatus = 'active' | 'paused' | 'error' | 'completed';

export interface WorkflowSchedule {
  id: string;
  name: string;
  type: WorkflowScheduleType;
  status: WorkflowScheduleStatus;
  scheduleDate: string;
  scheduledTime: string;
  lastRun: string;
  nextRun: string | null;
  endRun: string;
}

export interface PrintJob {
  id: string;
  name: string;
  type: string;
  association_name: string;
  association_id: string;
  pages: number;
  copies: number;
  status: 'pending' | 'printing' | 'completed' | 'error';
  certified: boolean;
  created_at: string;
  scheduled_for?: string;
  completed_at?: string;
}

export interface PrintSetting {
  default_printer: string;
  double_sided: boolean;
  include_mailing_labels: boolean;
  preview_before_print: boolean;
}
