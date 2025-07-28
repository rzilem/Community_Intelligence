// Enhanced Integration Framework Types for Phase 3

export type IntegrationType = 
  | 'financial' 
  | 'communication' 
  | 'document' 
  | 'vendor' 
  | 'insurance'
  | 'webhook';

export type IntegrationProvider = 
  | 'stripe' 
  | 'plaid' 
  | 'quickbooks' 
  | 'xero'
  | 'twilio'
  | 'sendgrid'
  | 'microsoft_teams'
  | 'slack'
  | 'docusign'
  | 'hellosign'
  | 'angies_list'
  | 'homeadvisor'
  | 'custom_webhook';

export interface IntegrationConfig {
  id: string;
  association_id: string;
  type: IntegrationType;
  provider: IntegrationProvider;
  name: string;
  description?: string;
  configuration: Record<string, any>;
  credentials?: Record<string, any>;
  is_active: boolean;
  is_test_mode: boolean;
  webhook_url?: string;
  rate_limit_per_minute?: number;
  retry_attempts?: number;
  timeout_seconds?: number;
  last_sync?: string;
  sync_status: 'idle' | 'syncing' | 'success' | 'error';
  error_message?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WebhookEvent {
  id: string;
  integration_id: string;
  event_type: string;
  payload: Record<string, any>;
  headers: Record<string, string>;
  processed: boolean;
  retry_count: number;
  response_status?: number;
  response_body?: string;
  error_message?: string;
  created_at: string;
  processed_at?: string;
}

export interface IntegrationLog {
  id: string;
  integration_id: string;
  action: 'sync' | 'webhook' | 'api_call' | 'test';
  status: 'success' | 'error' | 'timeout';
  request_data?: Record<string, any>;
  response_data?: Record<string, any>;
  error_message?: string;
  duration_ms?: number;
  created_at: string;
}

export interface RateLimitConfig {
  requests_per_minute: number;
  burst_limit: number;
  window_size_minutes: number;
}

export interface IntegrationTemplate {
  provider: IntegrationProvider;
  type: IntegrationType;
  name: string;
  description: string;
  config_fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'password' | 'number' | 'boolean' | 'select';
    required: boolean;
    options?: string[];
    placeholder?: string;
    help_text?: string;
  }>;
  default_rate_limit: RateLimitConfig;
  webhook_events?: string[];
}

export interface IntegrationHealth {
  integration_id: string;
  is_healthy: boolean;
  last_check: string;
  response_time_ms?: number;
  uptime_percentage: number;
  error_rate_percentage: number;
  recent_errors: string[];
}