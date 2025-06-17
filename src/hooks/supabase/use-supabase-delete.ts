
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KnownTables, showErrorToast, showSuccessToast } from './supabase-utils';

export function useSupabaseDelete(
  table: KnownTables,
  options: {
    onSuccess?: () => void;
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
    mutationFn: async (id: string): Promise<void> => {
      console.log(`Attempting to delete ${table} with ID: ${id}`);
      
      const { error } = await supabase
        .from(table as any)
        .delete()
        .eq(idField, id);

      if (error) {
        console.error(`Error deleting ${table}:`, error);
        if (shouldShowErrorToast) {
          showErrorToast('deleting', table, error);
        }
        throw error;
      }

      console.log(`Successfully deleted ${table} with ID: ${id}`);
      if (shouldShowSuccessToast) {
        showSuccessToast('deleted', table);
      }
    },
    onSuccess: () => {
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
        onSuccess();
      }
    },
    onError: (error: any) => {
      console.error('Delete mutation failed:', error);
    }
  });
}
