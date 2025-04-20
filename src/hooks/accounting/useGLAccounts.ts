import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GLAccount } from '@/types/accounting-types';
import { toast } from 'sonner';

type UseGLAccountsOptions = {
  associationId?: string;
  includeMaster?: boolean;
  includeCategories?: boolean;
  onlyActive?: boolean;
  onError?: (error: Error) => void;
  isActiveFilter?: boolean | null;
};

export const useGLAccounts = (options: UseGLAccountsOptions = {}) => {
  const { 
    associationId, 
    includeMaster = true, 
    includeCategories = false,
    onlyActive = false,
    onError,
    isActiveFilter = null,
  } = options;
  
  const [accounts, setAccounts] = useState<GLAccount[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchGLAccounts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase.from('gl_accounts').select('*');
      
      if (associationId) {
        if (includeMaster) {
          query = query.or(`association_id.eq.${associationId},association_id.is.null`);
        } else {
          query = query.eq('association_id', associationId);
        }
      } else if (!includeMaster) {
        setAccounts([]);
        setIsLoading(false);
        return;
      } else {
        query = query.is('association_id', null);
      }

      if (typeof isActiveFilter === 'boolean') {
        query = query.eq('is_active', isActiveFilter);
      }
      
      const { data, error } = await query.order('code', { ascending: true });
      if (error) {
        throw new Error(`Error fetching GL accounts: ${error.message}`);
      }
      
      const fetchedAccounts = data as GLAccount[];
      setAccounts(fetchedAccounts);

      if (includeCategories) {
        const uniqueCategories = Array.from(
          new Set(
            fetchedAccounts
              .filter(acc => acc.category)
              .map(acc => acc.category as string)
          )
        ).sort();
        setCategories(uniqueCategories);
      }
    } catch (err: any) {
      console.error('Error in fetchGLAccounts:', err);
      const error = new Error(err.message || 'Failed to load GL accounts');
      setError(error);
      
      if (onError) {
        onError(error);
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGLAccounts();
  }, [associationId, includeMaster, includeCategories, onlyActive, isActiveFilter]);
  
  return { 
    accounts, 
    categories,
    isLoading, 
    error,
    refreshAccounts: fetchGLAccounts 
  };
};

export const getFormattedGLAccountLabel = (account: GLAccount): string => {
  return `${account.code} - ${account.name}`;
};

export const getFormattedAccountCategories = (accounts: GLAccount[]): string[] => {
  return Array.from(
    new Set(
      accounts
        .filter(acc => acc.category)
        .map(acc => acc.category as string)
    )
  ).sort();
};
