
import { toast } from 'sonner';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Known tables in Supabase
 */
export type KnownTables = 
  | 'associations'
  | 'properties'
  | 'residents'
  | 'assessments'
  | 'compliance_issues'
  | 'calendary_events'
  | 'profiles'
  | 'leads'
  | 'homeowner_requests'
  | 'maintenance_requests'
  | 'invoices'
  | 'documents'
  | 'amenities'
  | 'resale_events'
  | 'calendar_events'
  | 'comments'
  | 'history'  // Added history table to known tables
  | string;  // Allow any string for dynamic tables

// Filter options
export interface QueryFilter {
  column: string;
  value: any;
  operator?: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'ilike' | 'is';
}

// Order options - Updated to support both single order and array of orders
export interface QueryOrder {
  column: string;
  ascending?: boolean;
}

// Query options - Updated to accept either a single order object or an array
export interface QueryOptions<T = any> {
  select?: string;
  filter?: QueryFilter[];
  limit?: number;
  order?: QueryOrder | QueryOrder[];
  single?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: PostgrestError) => void;
}

// Show error toast for Supabase operations
export function showErrorToast(
  operation: 'fetching' | 'creating' | 'updating' | 'deleting',
  table: string,
  error: PostgrestError
) {
  const errorPrefix = 
    operation === 'fetching' ? 'Error fetching' :
    operation === 'creating' ? 'Error creating' :
    operation === 'updating' ? 'Error updating' :
    'Error deleting';
  
  let errorMessage = `${errorPrefix} ${table}: ${error.message}`;
  
  // Handle common errors in a user-friendly way
  if (error.code === '42P01') {
    errorMessage = `The ${table} table does not exist yet.`;
  } else if (error.code === '28P01') {
    errorMessage = 'Authentication failed. Please check your credentials.';
  } else if (error.code === '23505') {
    errorMessage = 'A record with this information already exists.';
  } else if (error.code === '23503') {
    errorMessage = 'This operation would violate database integrity.';
  }
  
  toast.error(errorMessage, {
    duration: 5000,
    id: `supabase-error-${table}-${operation}`, // Ensure we don't show duplicate toasts
  });
}

// Show success toast for Supabase operations
export function showSuccessToast(
  operation: 'created' | 'updated' | 'deleted',
  table: string
) {
  const successMessage = 
    operation === 'created' ? `${table} successfully created` :
    operation === 'updated' ? `${table} successfully updated` :
    `${table} successfully deleted`;
  
  toast.success(successMessage, {
    duration: 3000,
    id: `supabase-success-${table}-${operation}`, // Ensure we don't show duplicate toasts
  });
}
