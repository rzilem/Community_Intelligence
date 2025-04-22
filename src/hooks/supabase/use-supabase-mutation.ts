
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MutationOptions<TData = any, TError = Error, TVariables = any> {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  onSettled?: (data: TData | undefined, error: TError | null) => void;
}

export const useSupabaseMutation = <TData = any, TError = Error, TVariables = any>(
  table: string,
  operation: 'insert' | 'update' | 'delete' | 'upsert' = 'insert',
  options?: MutationOptions<TData, TError, TVariables>
) => {
  const mutationFn = async (variables: TVariables) => {
    let query;

    switch (operation) {
      case 'insert':
        query = supabase.from(table).insert(variables);
        break;
      case 'update':
        query = supabase.from(table).update(variables);
        break;
      case 'delete':
        query = supabase.from(table).delete();
        break;
      case 'upsert':
        query = supabase.from(table).upsert(variables);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data as TData;
  };

  const mutationOptions: UseMutationOptions<TData, TError, TVariables> = {
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    onSettled: options?.onSettled,
  };

  return useMutation({
    mutationFn,
    ...mutationOptions
  });
};
