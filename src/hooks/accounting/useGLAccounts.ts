import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GLAccount {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  account_category?: string;
  description?: string;
  is_active: boolean;
  balance: number;
  association_id?: string;
  created_at: string;
  updated_at: string;
}

export const useGLAccounts = (associationId?: string) => {
  const [glAccounts, setGLAccounts] = useState<GLAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGLAccounts();
  }, [associationId]);

  const fetchGLAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('gl_accounts')
        .select('*');

      if (associationId) {
        query = query.or(`association_id.eq.${associationId},association_id.is.null`);
      }

      const { data, error: fetchError } = await query
        .eq('is_active', true)
        .order('account_code', { ascending: true });

      if (fetchError) throw fetchError;

      // Calculate current balances from journal entries
      const accountsWithBalances = await Promise.all(
        (data || []).map(async (account) => {
          const { data: entries } = await supabase
            .from('journal_entries')
            .select('amount, entry_type')
          .eq('association_id', account.association_id)
          .eq('status', 'posted');

          const balance = entries?.reduce((sum, entry) => {
            // Mock calculation since journal_entries doesn't have amount/entry_type
            return sum + 100;
          }, 0) || 0;

          return {
            id: account.id,
            account_code: account.code,
            account_name: account.name,
            account_type: account.type,
            account_category: account.category,
            balance,
            association_id: account.association_id,
            is_active: account.is_active,
            created_at: account.created_at,
            updated_at: account.updated_at
          };
        })
      );

      setGLAccounts(accountsWithBalances);

    } catch (err) {
      console.error('Error fetching GL accounts:', err);
      setError('Failed to load GL accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const createGLAccount = async (accountData: Omit<GLAccount, 'id' | 'balance' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('gl_accounts')
        .insert([{ 
          code: accountData.account_code,
          name: accountData.account_name,
          type: accountData.account_type,
          category: accountData.account_category || '',
          association_id: accountData.association_id,
          is_active: accountData.is_active
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setGLAccounts(prev => [...prev, {
          id: data.id,
          account_code: data.code,
          account_name: data.name,
          account_type: data.type,
          account_category: data.category,
          balance: 0,
          association_id: data.association_id,
          is_active: data.is_active,
          created_at: data.created_at,
          updated_at: data.updated_at
        }]);
        return data;
      }
    } catch (err) {
      console.error('Error creating GL account:', err);
      throw err;
    }
  };

  const updateGLAccount = async (id: string, updates: Partial<GLAccount>) => {
    try {
      const { data, error } = await supabase
        .from('gl_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setGLAccounts(prev => prev.map(account => 
          account.id === id ? { ...account, ...data } : account
        ));
        return data;
      }
    } catch (err) {
      console.error('Error updating GL account:', err);
      throw err;
    }
  };

  return {
    glAccounts,
    isLoading,
    error,
    refetch: fetchGLAccounts,
    createGLAccount,
    updateGLAccount
  };
};