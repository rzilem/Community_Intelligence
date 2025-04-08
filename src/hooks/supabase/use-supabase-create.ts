
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KnownTables, showErrorToast, showSuccessToast } from './supabase-utils';

export function useSupabaseCreate<T = any>(
  table: KnownTables,
  options: {
    onSuccess?: (data: T) => void;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    invalidateQueries?: string[] | string[][];
  } = {}
) {
  const queryClient = useQueryClient();
  const { 
    onSuccess, 
    showSuccessToast: shouldShowSuccessToast = true,
    showErrorToast: shouldShowErrorToast = true,
    invalidateQueries = [[table]]
  } = options;

  return useMutation({
    mutationFn: async (data: Partial<T>): Promise<T> => {
      const { data: result, error } = await supabase
        .from(table as any)
        .insert(data as any)
        .select()
        .single();

      if (error) {
        if (shouldShowErrorToast) {
          showErrorToast('creating', table, error);
        }
        throw error;
      }

      if (shouldShowSuccessToast) {
        showSuccessToast('created', table);
      }

      return result as T;
    },
    onSuccess: (data) => {
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
