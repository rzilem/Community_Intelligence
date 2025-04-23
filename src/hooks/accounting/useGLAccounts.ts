
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GLAccount } from '@/types/accounting-types';
import { toast } from 'sonner';

interface UseGLAccountsOptions {
  associationId?: string;
  includeMaster?: boolean;
  activeOnly?: boolean;
}

export const getFormattedGLAccountLabel = (account: GLAccount): string => {
  return `${account.code} - ${account.name}`;
};

export const useGLAccounts = (options: UseGLAccountsOptions = {}) => {
  const { associationId, includeMaster = false, activeOnly = true } = options;
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ['glAccounts', associationId, includeMaster, activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('gl_accounts')
        .select('*')
        .order('code');
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      
      if (associationId) {
        if (includeMaster) {
          query = query.or(`association_id.eq.${associationId},association_id.is.null`);
        } else {
          query = query.eq('association_id', associationId);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });

  const createGLAccount = useMutation({
    mutationFn: async (account: Partial<GLAccount>) => {
      const { data, error } = await supabase
        .from('gl_accounts')
        .insert(account)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('GL account created successfully');
      queryClient.invalidateQueries({ queryKey: ['glAccounts'] });
    },
    onError: (error) => {
      toast.error(`Failed to create GL account: ${error.message}`);
    }
  });

  const updateGLAccount = useMutation({
    mutationFn: async ({ id, ...account }: Partial<GLAccount> & { id: string }) => {
      const { data, error } = await supabase
        .from('gl_accounts')
        .update(account)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('GL account updated successfully');
      queryClient.invalidateQueries({ queryKey: ['glAccounts'] });
    },
    onError: (error) => {
      toast.error(`Failed to update GL account: ${error.message}`);
    }
  });

  return {
    accounts,
    isLoading,
    error,
    createGLAccount,
    updateGLAccount
  };
};
