
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KnownTables, showErrorToast, showSuccessToast } from './supabase-utils';

// Define a custom error interface that includes the code property
interface SupabaseError extends Error {
  code?: string;
}

/**
 * Custom hook for updating data in Supabase tables with enhanced security
 */
export function useSupabaseUpdate<T = any>(
  table: KnownTables,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    invalidateQueries?: string[] | string[][];
    idField?: string;
  } = {}
) {
  const queryClient = useQueryClient();
  const { 
    onSuccess, 
    onError,
    showSuccessToast: shouldShowSuccessToast = true,
    showErrorToast: shouldShowErrorToast = true,
    invalidateQueries = [[table]],
    idField = 'id'
  } = options;

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }): Promise<T> => {
      // Validate input
      if (!id) {
        throw new Error("Invalid ID provided");
      }
      
      if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        throw new Error("No valid data provided for update");
      }
      
      // Security check: Ensure id is UUID format to prevent SQL injection
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        throw new Error("Invalid ID format");
      }
      
      console.log(`Updating ${table} with ID ${id}:`, data);
      
      // Make sure we're not sending any 'unassigned' string values to the database
      // Convert any 'unassigned' values to null
      const cleanData = Object.fromEntries(
        Object.entries(data as any).map(([key, value]) => [
          key, 
          value === 'unassigned' ? null : value
        ])
      );
      
      console.log(`Cleaned data for ${table} update:`, cleanData);
      
      // Sanitize any string values to prevent injection
      const sanitizedData = Object.fromEntries(
        Object.entries(cleanData).map(([key, value]) => [
          key, 
          typeof value === 'string' ? value.replace(/['";=]/g, '') : value
        ])
      );
      
      const { data: result, error } = await supabase
        .from(table as any)
        .update(sanitizedData)
        .eq(idField, id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating ${table}:`, error);
        if (shouldShowErrorToast) {
          showErrorToast('updating', table, error);
        }
        throw error;
      }

      console.log(`${table} updated successfully:`, result);
      
      if (shouldShowSuccessToast) {
        showSuccessToast('updated', table);
      }

      return result as T;
    },
    onSuccess: (data) => {
      console.log('Mutation successful, invalidating queries');
      // Invalidate related queries
      if (Array.isArray(invalidateQueries[0])) {
        // Multiple query keys to invalidate
        (invalidateQueries as string[][]).forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      } else {
        // Single query key to invalidate
        queryClient.invalidateQueries({ queryKey: invalidateQueries as string[] });
      }

      // Call custom onSuccess handler if provided
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      // Standardized error handling
      console.error(`Error in ${table} update:`, error);
      
      // Don't expose sensitive error details to the function consumer
      // Cast the error to our SupabaseError type to safely access the code property
      const safeError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: (error as SupabaseError).code || 'UNKNOWN_ERROR'
      };
      
      if (onError) {
        onError(safeError);
      }
    }
  });
}
