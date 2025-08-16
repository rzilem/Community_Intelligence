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
            .eq('account_name', account.account_name)
            .eq('status', 'posted');

          const balance = entries?.reduce((sum, entry) => {
            const amount = Number(entry.amount) || 0;
            return entry.entry_type === 'debit' ? sum + amount : sum - amount;
          }, 0) || 0;

          return {
            ...account,
            balance
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
        .insert([{ ...accountData, balance: 0 }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setGLAccounts(prev => [...prev, { ...data, balance: 0 }]);
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