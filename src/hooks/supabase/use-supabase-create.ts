
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { KnownTables, QueryOptions, showErrorToast, showSuccessToast } from './supabase-utils';

/**
 * Hook for creating an item in Supabase
 * @param tableName The table to insert into
 * @param options Options for success handler and cache invalidation
 */
export function useSupabaseCreate<T = any>(
  tableName: KnownTables, 
  options?: Pick<QueryOptions<T>, 'onSuccess' | 'invalidateQueries'>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: Partial<T>) => {
      // Use explicit type assertion to bypass TypeScript type checking
      const { data, error } = await supabase
        .from(tableName as any)
        .insert(item as any)
        .select();
      
      if (error) {
        showErrorToast('creating', tableName, error);
        throw error;
      }
      
      return data[0] as T;
    },
    onSuccess: (data) => {
      showSuccessToast('created', tableName);
      
      if (options?.onSuccess) {
        options.onSuccess(data);
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
