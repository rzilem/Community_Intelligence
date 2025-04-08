
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Type for database tables that we know are valid
type KnownTables = 
  | 'associations'
  | 'properties'
  | 'residents'
  | 'profiles'
  | 'documents'
  | 'calendar_events'
  | 'bank_accounts'
  | string; // Allow any string for flexibility, but with known ones for autocomplete

// Hook for fetching data from Supabase
export function useSupabaseQuery<T = any>(
  key: string | string[],
  tableName: KnownTables,
  options?: {
    select?: string;
    filter?: { column: string; value: any; operator?: string }[];
    limit?: number;
    order?: { column: string; ascending?: boolean };
    single?: boolean;
  }
) {
  const queryKey = Array.isArray(key) ? key : [key];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase.from(tableName).select(options?.select || '*');
      
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
        toast.error(`Error fetching ${tableName}: ${error.message}`);
        throw error;
      }
      
      return data as T;
    }
  });
}

// Hook for creating an item in Supabase
export function useSupabaseCreate<T = any>(
  tableName: KnownTables, 
  options?: { 
    onSuccess?: (data: T) => void;
    invalidateQueries?: string[] | string[][];
  }
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: Partial<T>) => {
      const { data, error } = await supabase
        .from(tableName)
        .insert(item)
        .select();
      
      if (error) {
        toast.error(`Error creating ${tableName}: ${error.message}`);
        throw error;
      }
      
      return data[0] as T;
    },
    onSuccess: (data) => {
      toast.success(`Successfully created ${tableName}`);
      
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

// Hook for updating an item in Supabase
export function useSupabaseUpdate<T = any>(
  tableName: KnownTables, 
  options?: { 
    onSuccess?: (data: T) => void;
    invalidateQueries?: string[] | string[][];
  }
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<T> & { id: string }) => {
      const { data, error } = await supabase
        .from(tableName)
        .update(item)
        .eq('id', id)
        .select();
      
      if (error) {
        toast.error(`Error updating ${tableName}: ${error.message}`);
        throw error;
      }
      
      return data[0] as T;
    },
    onSuccess: (data) => {
      toast.success(`Successfully updated ${tableName}`);
      
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

// Hook for deleting an item from Supabase
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
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error(`Error deleting ${tableName}: ${error.message}`);
        throw error;
      }
      
      return id;
    },
    onSuccess: (id) => {
      toast.success(`Successfully deleted ${tableName}`);
      
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
