
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GLAccount } from '@/types/accounting-types';
import { ensureValidAccountType, ensureValidAccountTypes } from '@/utils/accounting-helpers';

// Formatting function for displaying account label with code
export function getFormattedGLAccountLabel(account: GLAccount): string {
  if (!account) return 'Unknown Account';
  return `${account.code} - ${account.name}`;
}

// Get unique account categories
export function getFormattedAccountCategories(accounts: GLAccount[]): string[] {
  const categories = [...new Set(accounts.map(account => account.category || 'Uncategorized'))];
  return categories.filter(cat => cat !== null && cat !== undefined).sort();
}

interface UseGLAccountsProps {
  associationId?: string;
  includeMaster?: boolean;
}

export function useGLAccounts({ associationId, includeMaster = false }: UseGLAccountsProps = {}) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);

  // Fetch GL accounts
  const { 
    data: accounts = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['glAccounts', associationId, includeMaster, activeOnly, searchTerm],
    queryFn: async () => {
      let query = supabase.from('gl_accounts').select('*');
      
      // Filter by association ID if provided
      if (associationId) {
        query = includeMaster 
          ? query.or(`association_id.eq.${associationId},association_id.is.null`) 
          : query.eq('association_id', associationId);
      } else if (!includeMaster) {
        // If not association specific and not including master, return empty array
        return [];
      }
      
      // Apply active filter if needed
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      
      // Apply search if provided
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      // Sort by code
      query = query.order('code');
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching GL accounts:', error);
        throw error;
      }
      
      // Ensure all accounts have valid types before returning
      return ensureValidAccountTypes(data || []);
    }
  });

  // Create GL account
  const createGLAccount = useMutation({
    mutationFn: async (account: Partial<GLAccount>) => {
      // Validate and normalize the account type
      const validatedAccount = ensureValidAccountType(account);
      
      const { data, error } = await supabase
        .from('gl_accounts')
        .insert(validatedAccount)
        .select();
      
      if (error) {
        console.error('Error creating GL account:', error);
        throw error;
      }
      
      return data[0] as GLAccount;
    },
    onSuccess: () => {
      toast.success('GL Account created successfully!');
      queryClient.invalidateQueries({ queryKey: ['glAccounts'] });
    }
  });

  // Update GL account
  const updateGLAccount = useMutation({
    mutationFn: async (account: GLAccount) => {
      // Validate and normalize the account type
      const validatedAccount = ensureValidAccountType(account);
      
      const { data, error } = await supabase
        .from('gl_accounts')
        .update(validatedAccount)
        .eq('id', account.id)
        .select();
      
      if (error) {
        console.error('Error updating GL account:', error);
        throw error;
      }
      
      return data[0] as GLAccount;
    },
    onSuccess: () => {
      toast.success('GL Account updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['glAccounts'] });
    }
  });

  // Delete GL account
  const deleteGLAccount = useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase
        .from('gl_accounts')
        .delete()
        .eq('id', accountId);
      
      if (error) {
        console.error('Error deleting GL account:', error);
        throw error;
      }
      
      return accountId;
    },
    onSuccess: () => {
      toast.success('GL Account deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['glAccounts'] });
    }
  });

  return {
    accounts: accounts as GLAccount[],
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    activeOnly,
    setActiveOnly,
    createGLAccount,
    updateGLAccount,
    deleteGLAccount
  };
}
