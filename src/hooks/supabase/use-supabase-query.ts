
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface QueryOptions {
  select?: string;
  order?: { column: string; ascending: boolean };
  limit?: number;
  filters?: Array<{ column: string; value: string }>;
  equal?: Record<string, any>;
  range?: { from: number; to: number };
  enabled?: boolean;
}

export const useSupabaseQuery = <T = any>(
  tableName: string,
  options: QueryOptions = {},
  queryOptions?: Omit<UseQueryOptions<T[], Error>, 'queryKey' | 'queryFn'>
) => {
  const queryKey = [tableName, options];
  
  return useQuery<T[], Error>({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from(tableName)
        .select(options.select || '*');

      // Apply filters if any
      if (options.filters) {
        options.filters.forEach(filter => {
          query = query.eq(filter.column, filter.value);
        });
      }

      // Apply equals conditions if any
      if (options.equal) {
        Object.entries(options.equal).forEach(([column, value]) => {
          query = query.eq(column, value);
        });
      }

      // Apply range if specified
      if (options.range) {
        query = query.range(options.range.from, options.range.to);
      }

      // Apply order if specified
      if (options.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending });
      }

      // Apply limit if specified
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as T[];
    },
    enabled: options.enabled !== false,
    ...queryOptions
  });
};
