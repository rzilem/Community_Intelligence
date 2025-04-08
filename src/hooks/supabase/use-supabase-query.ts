
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KnownTables, QueryOptions, showErrorToast } from './supabase-utils';

export function useSupabaseQuery<T = any>(
  table: KnownTables, 
  options: QueryOptions<T> = {}, 
  enabled: boolean = true
) {
  const { 
    select = '*', 
    filter = [], 
    limit,
    order,
    single = false,
    onSuccess,
  } = options;

  const queryKey = [table, select, filter, limit, order, single];

  return useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      let query = supabase
        .from(table as any)
        .select(select);

      // Apply filters
      filter.forEach(({ column, value, operator = 'eq' }) => {
        if (operator === 'eq') {
          query = query.eq(column, value);
        } else if (operator === 'neq') {
          query = query.neq(column, value);
        } else if (operator === 'gt') {
          query = query.gt(column, value);
        } else if (operator === 'lt') {
          query = query.lt(column, value);
        } else if (operator === 'gte') {
          query = query.gte(column, value);
        } else if (operator === 'lte') {
          query = query.lte(column, value);
        } else if (operator === 'like') {
          query = query.like(column, value);
        } else if (operator === 'ilike') {
          query = query.ilike(column, value);
        } else if (operator === 'is') {
          query = query.is(column, value);
        }
      });

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      // Apply ordering
      if (order) {
        query = query.order(order.column, { ascending: order.ascending ?? true });
      }

      // Get single result if requested
      if (single) {
        const { data, error } = await query.single();
        
        if (error) {
          showErrorToast('fetching', table, error);
          throw error;
        }
        
        return data as T;
      }

      // Get multiple results
      const { data, error } = await query;
      
      if (error) {
        showErrorToast('fetching', table, error);
        throw error;
      }
      
      // Return data as an array to ensure consistent typing
      return (data || []) as T;
    },
    enabled: enabled,
    meta: {
      onSuccess
    },
  });
}
