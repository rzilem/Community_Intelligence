
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
  | 'calendar_events'
  | 'announcements'
  | 'compliance_issues'
  | 'assessments'
  | 'bank_accounts'
  | 'bank_statements'
  | 'bank_transactions';

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
