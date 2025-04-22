
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KnownTables, QueryOptions, showErrorToast } from './supabase-utils';

export function useSupabaseQuery<T = any>(
  table: KnownTables, 
  options: QueryOptions<T> = {}, 
  enabled: boolean | (() => boolean) = true
) {
  const { 
    select = '*', 
    filter = [], 
    limit,
    order,
    single = false,
    onSuccess,
    onError,
  } = options;

  const queryKey = [table, select, filter, limit, order, single];

  return useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      console.log(`Executing query for table: ${table} with filters:`, filter);
      
      let query = supabase
        .from(table as any)
        .select(select);

      // Apply filters - skip if value is 'unassigned' since that's not a valid UUID
      filter.forEach(({ column, value, operator = 'eq' }) => {
        if (value === null || value === undefined || value === 'unassigned') {
          // Skip filters with null/undefined/'unassigned' values to prevent query errors
          console.log(`Skipping filter for column ${column} with value:`, value);
          return;
        }
        
        console.log(`Applying filter: ${column} ${operator} ${value}`);
        
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

      // Apply ordering - fix the order handling to support both object and array formats
      if (order) {
        if (Array.isArray(order)) {
          // Handle array of order objects
          order.forEach(orderItem => {
            query = query.order(orderItem.column, { ascending: orderItem.ascending ?? true });
          });
        } else {
          // Handle single order object
          query = query.order(order.column, { ascending: order.ascending ?? true });
        }
      }

      // Get single result if requested
      if (single) {
        console.log('Executing single() query');
        try {
          const { data, error } = await query.single();
          
          if (error) {
            console.error(`Error fetching from ${table}:`, error);
            
            // Use custom error handler if provided, otherwise show toast
            if (onError) {
              onError(error);
            } else {
              showErrorToast('fetching', table, error);
            }
            
            return null; // Return null instead of throwing so the UI can handle it gracefully
          }
          
          console.log(`Data fetched from ${table} (single):`, data);
          return data as T;
        } catch (error: any) {
          console.error(`Error with single() from ${table}:`, error);
          return null; // Return null on any error
        }
      }

      // Get multiple results
      console.log('Executing regular query');
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching from ${table}:`, error);
        
        // Use custom error handler if provided, otherwise show toast
        if (onError) {
          onError(error);
        } else {
          showErrorToast('fetching', table, error);
        }
        
        return [] as T; // Return empty array instead of throwing
      }
      
      console.log(`Data fetched from ${table}:`, data);
      // Return data as an array to ensure consistent typing
      return (data || []) as T;
    },
    enabled,
    meta: {
      onSuccess,
      onError
    },
    retry: false,  // Don't retry if the query fails to avoid spamming the console with errors
  });
}
