
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { KnownTables, QueryOptions, showErrorToast } from './supabase-utils';

/**
 * Hook for fetching data from Supabase
 * @param key Query key for React Query cache
 * @param tableName The table to query
 * @param options Query options for filtering, selecting, and ordering data
 */
export function useSupabaseQuery<T = any>(
  key: string | string[],
  tableName: KnownTables,
  options?: Pick<QueryOptions<T>, 'select' | 'filter' | 'limit' | 'order' | 'single'>
) {
  const queryKey = Array.isArray(key) ? key : [key];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Use explicit type assertion to bypass TypeScript type checking
      let query = supabase.from(tableName as any).select(options?.select || '*');
      
      // Apply filters if provided
      if (options?.filter && options.filter.length > 0) {
        options.filter.forEach(filter => {
          const operator = filter.operator || 'eq';
          
          switch (operator) {
            case 'eq':
              query = query.eq(filter.column, filter.value);
              break;
            case 'neq':
              query = query.neq(filter.column, filter.value);
              break;
            case 'gt':
              query = query.gt(filter.column, filter.value);
              break;
            case 'lt':
              query = query.lt(filter.column, filter.value);
              break;
            case 'gte':
              query = query.gte(filter.column, filter.value);
              break;
            case 'lte':
              query = query.lte(filter.column, filter.value);
              break;
            case 'like':
              query = query.like(filter.column, `%${filter.value}%`);
              break;
            case 'ilike':
              query = query.ilike(filter.column, `%${filter.value}%`);
              break;
            case 'in':
              query = query.in(filter.column, filter.value);
              break;
          }
        });
      }
      
      // Apply ordering if provided
      if (options?.order) {
        query = query.order(options.order.column, {
          ascending: options.order.ascending !== false
        });
      }
      
      // Apply limit if provided
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = options?.single
        ? await query.single()
        : await query;
      
      if (error) {
        showErrorToast('fetching', tableName, error);
        throw error;
      }
      
      return data as T;
    }
  });
}
