
// Advanced vendor operation types for Milestone 4

export interface VendorPerformanceMetrics {
  id: string;
  vendor_id: string;
  association_id: string;
  reporting_period: string;
  total_jobs: number;
  completed_jobs: number;
  on_time_jobs: number;
  average_completion_days?: number;
  average_rating?: number;
  total_revenue: number;
  customer_satisfaction_score?: number;
  response_time_hours?: number;
  quality_score?: number;
  created_at: string;
  updated_at: string;
}

export interface VendorWorkflowAutomation {
  id: string;
  association_id: string;
  name: string;
  description?: string;
  trigger_type: 'contract_expiry' | 'performance_threshold' | 'compliance_due' | 'payment_overdue' | 'custom';
  trigger_conditions: Record<string, any>;
  actions: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorWorkflowExecution {
  id: string;
  workflow_id: string;
  vendor_id?: string;
  trigger_data?: Record<string, any>;
  execution_status: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  results?: Record<string, any>;
  created_at: string;
}

export interface VendorIntegration {
  id: string;
  vendor_id: string;
  integration_type: 'api' | 'email' | 'portal' | 'accounting' | 'calendar';
  integration_name: string;
  configuration: Record<string, any>;
  credentials?: Record<string, any>;
  is_active: boolean;
  last_sync?: string;
  sync_status: 'pending' | 'syncing' | 'success' | 'error';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorNotification {
  id: string;
  vendor_id?: string;
  association_id: string;
  notification_type: 'contract_expiry' | 'compliance_due' | 'payment_overdue' | 'performance_alert' | 'bid_invitation' | 'custom';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  scheduled_for?: string;
  sent_at?: string;
  read_at?: string;
  delivery_method: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface VendorBidAnalytics {
  id: string;
  vendor_id: string;
  bid_request_id: string;
  association_id: string;
  bid_amount?: number;
  response_time_hours?: number;
  was_selected: boolean;
  selection_reason?: string;
  feedback_score?: number;
  feedback_comments?: string;
  created_at: string;
}

export interface VendorCategory {
  id: string;
  association_id: string;
  name: string;
  description?: string;
  parent_category_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorCategoryAssignment {
  id: string;
  vendor_id: string;
  category_id: string;
  is_primary: boolean;
  created_at: string;
}

export interface VendorAnalyticsData {
  performance_metrics: VendorPerformanceMetrics[];
  bid_analytics: VendorBidAnalytics[];
  success_rate: number;
  average_response_time: number;
  total_revenue: number;
  customer_satisfaction: number;
}

export interface WorkflowTriggerData {
  vendor_id?: string;
  contract_id?: string;
  compliance_item_id?: string;
  performance_metric?: VendorPerformanceMetrics;
  custom_data?: Record<string, any>;
}

export interface NotificationTemplate {
  type: VendorNotification['notification_type'];
  title_template: string;
  message_template: string;
  default_priority: VendorNotification['priority'];
}
