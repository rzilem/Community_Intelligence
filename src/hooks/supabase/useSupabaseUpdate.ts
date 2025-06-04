
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KnownTables, showErrorToast, showSuccessToast } from './supabase-utils';

interface UpdateParams {
  id: string;
  data: Record<string, any>;
}

export function useSupabaseUpdate(table: KnownTables) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateParams) => {
      console.log(`Updating ${table} with id ${id}:`, data);
      
      const { data: result, error } = await supabase
        .from(table as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating ${table}:`, error);
        throw error;
      }

      return result;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [table] });
      console.log(`Successfully updated ${table}:`, data);
    },
    onError: (error: any) => {
      showErrorToast('updating', table, error);
    }
  });
}
