
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KnownTables, showErrorToast, showSuccessToast } from './supabase-utils';

export function useSupabaseUpdate<T = any>(
  table: KnownTables,
  options: {
    onSuccess?: (data: T) => void;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    invalidateQueries?: string[] | string[][];
    idField?: string;
  } = {}
) {
  const queryClient = useQueryClient();
  const { 
    onSuccess, 
    showSuccessToast: shouldShowSuccessToast = true,
    showErrorToast: shouldShowErrorToast = true,
    invalidateQueries = [[table]],
    idField = 'id'
  } = options;

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }): Promise<T> => {
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
      
      const { data: result, error } = await supabase
        .from(table as any)
        .update(cleanData)
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
    }
  });
}
