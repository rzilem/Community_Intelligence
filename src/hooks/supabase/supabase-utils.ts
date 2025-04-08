
import { toast } from 'sonner';

// Type for database tables that we know are valid
export type KnownTables = 
  | 'associations'
  | 'properties'
  | 'residents'
  | 'profiles'
  | 'documents'
  | 'calendar_events'
  | string; // Allow any string but with known ones for autocomplete

// Common filtering types
export interface FilterOption {
  column: string;
  value: any;
  operator?: string;
}

export interface QueryOptions<T = any> {
  select?: string;
  filter?: FilterOption[];
  limit?: number;
  order?: { column: string; ascending?: boolean };
  single?: boolean;
  onSuccess?: (data: T) => void;
  invalidateQueries?: string[] | string[][];
}

// Helper function to display error toasts
export const showErrorToast = (action: string, tableName: string, error: Error): void => {
  toast.error(`Error ${action} ${tableName}: ${error.message}`);
};

// Helper function to display success toasts
export const showSuccessToast = (action: string, tableName: string): void => {
  toast.success(`Successfully ${action} ${tableName}`);
};
