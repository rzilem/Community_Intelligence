
import { toast } from 'sonner';

// Known table names for type safety
export type KnownTables = 
  | 'profiles'
  | 'associations' 
  | 'association_users'
  | 'properties'
  | 'residents'
  | 'homeowner_requests'
  | 'leads'
  | 'invoices'
  | 'email_templates'
  | 'email_campaigns'
  | 'resale_events'
  | 'documents'
  | 'document_categories'
  | 'calendar_events'
  | 'announcements'
  | 'compliance_issues'
  | 'assessments'
  | 'assessment_schedules'
  | 'accounts_receivable'
  | 'accounts_payable'
  | 'bank_accounts'
  | 'bank_statements'
  | 'bank_transactions'
  | 'amenities'
  | 'onboarding_projects'
  | 'onboarding_templates'
  | 'communications'
  | 'communication_recipients'
  | 'communication_templates'
  | 'bid_requests'
  | 'bid_request_vendors'
  | 'bid_request_images'
  | 'vendors'
  | 'association_photos'
  | 'association_settings'
  | 'ai_conversations'
  | 'ai_insights'
  | 'ai_models'
  | 'proposal_sections'
  | 'proposal_views'
  | 'proposals'
  | 'gl_accounts'
  | 'journal_entries'
  | 'ledger_entries'
  | 'letter_templates'
  | 'html_templates'
  | 'payment_terms'
  | 'email_sequences'
  | 'email_workflows'
  | 'file_operation_logs'
  | 'report_data'
  | 'v_trial_balance'
  | 'v_income_statement'
  | 'v_balance_sheet';

// Filter operators
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'ilike' | 'is';

// Filter type
export interface Filter {
  column: string;
  value: any;
  operator?: FilterOperator;
}

// Order type
export interface Order {
  column: string;
  ascending?: boolean;
}

// Query options interface
export interface QueryOptions<T = any> {
  select?: string;
  filter?: Filter[];
  limit?: number;
  order?: Order | Order[];
  single?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

// Error handling utility
export const showErrorToast = (operation: string, table: string, error: any) => {
  console.error(`Error ${operation} from ${table}:`, error);
  const message = error?.message || `Failed to ${operation} ${table}`;
  toast.error(message);
};

// Success handling utility
export const showSuccessToast = (operation: string, table: string) => {
  toast.success(`Successfully ${operation} ${table}`);
};
