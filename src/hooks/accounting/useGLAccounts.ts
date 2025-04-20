
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GLAccount } from '@/types/accounting-types';
import { toast } from 'sonner';

type UseGLAccountsOptions = {
  associationId?: string;
  includeMaster?: boolean;
  onError?: (error: Error) => void;
};

export const useGLAccounts = (options: UseGLAccountsOptions = {}) => {
  const { associationId, includeMaster = true, onError } = options;
  
  const [accounts, setAccounts] = useState<GLAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchGLAccounts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase.from('gl_accounts').select('*');
      
      if (associationId) {
        // If we have an association ID and we should include master accounts
        if (includeMaster) {
          // This will get both association-specific accounts AND master accounts (association_id is null)
          // Fixed: Using 'is' instead of 'eq' for null values
          query = query.or(`association_id.eq.${associationId},association_id.is.null`);
        } else {
          // Only get association-specific accounts
          query = query.eq('association_id', associationId);
        }
      } else if (!includeMaster) {
        // If we don't want master accounts and no association ID, return empty
        setAccounts([]);
        setIsLoading(false);
        return;
      } else {
        // Only get master accounts - Fixed: Using 'is' instead of 'eq' for null
        query = query.is('association_id', null);
      }
      
      // Execute query and sort by code
      const { data, error } = await query.order('code', { ascending: true });
      
      if (error) {
        throw new Error(`Error fetching GL accounts: ${error.message}`);
      }
      
      setAccounts(data as GLAccount[]);
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
  }, [associationId, includeMaster]);
  
  return { 
    accounts, 
    isLoading, 
    error,
    refreshAccounts: fetchGLAccounts 
  };
};
