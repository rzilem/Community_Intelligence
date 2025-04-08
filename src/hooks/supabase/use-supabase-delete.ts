
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { KnownTables, QueryOptions, showErrorToast, showSuccessToast } from './supabase-utils';

/**
 * Hook for deleting an item from Supabase
 * @param tableName The table to delete from
 * @param options Options for success handler and cache invalidation
 */
export function useSupabaseDelete(
  tableName: KnownTables, 
  options?: { 
    onSuccess?: () => void;
    invalidateQueries?: string[] | string[][];
  }
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Use explicit type assertion to bypass TypeScript type checking
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', id);
      
      if (error) {
        showErrorToast('deleting', tableName, error);
        throw error;
      }
      
      return id;
    },
    onSuccess: (id) => {
      showSuccessToast('deleted', tableName);
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
      
      if (options?.invalidateQueries) {
        const queries = Array.isArray(options.invalidateQueries[0])
          ? options.invalidateQueries as string[][]
          : [options.invalidateQueries] as string[][];
          
        queries.forEach(query => {
          queryClient.invalidateQueries({ queryKey: query });
        });
      } else {
        queryClient.invalidateQueries({ queryKey: [tableName] });
      }
    }
  });
}
