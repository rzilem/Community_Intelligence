
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Budget, BudgetEntry } from '@/types/accounting-types';
import { toast } from 'sonner';

export const useBudgets = (associationId?: string) => {
  const queryClient = useQueryClient();

  const { data: budgets = [], isLoading, error } = useQuery({
    queryKey: ['budgets', associationId],
    queryFn: async () => {
      if (!associationId) return [];
      
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('association_id', associationId)
        .order('year', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!associationId
  });

  const getBudgetDetails = async (budgetId: string) => {
    try {
      // Get budget
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', budgetId)
        .single();
      
      if (budgetError) throw budgetError;
      
      // Get budget entries
      const { data: entries, error: entriesError } = await supabase
        .from('budget_entries')
        .select(`
          *,
          gl_account:gl_account_id (id, code, name, type, category)
        `)
        .eq('budget_id', budgetId);
      
      if (entriesError) throw entriesError;
      
      return {
        ...budget,
        entries: entries || []
      };
    } catch (error) {
      console.error('Error fetching budget details:', error);
      throw error;
    }
  };

  const createBudget = useMutation({
    mutationFn: async (budget: Partial<Budget>) => {
      const { data, error } = await supabase
        .from('budgets')
        .insert(budget)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Budget created successfully');
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: (error) => {
      toast.error(`Failed to create budget: ${error.message}`);
    }
  });

  const createBudgetEntry = useMutation({
    mutationFn: async (entry: Partial<BudgetEntry>) => {
      const { data, error } = await supabase
        .from('budget_entries')
        .insert(entry)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success('Budget entry created successfully');
      queryClient.invalidateQueries({ queryKey: ['budgets', variables.budget_id] });
    },
    onError: (error) => {
      toast.error(`Failed to create budget entry: ${error.message}`);
    }
  });

  const updateBudget = useMutation({
    mutationFn: async ({ id, ...budget }: Partial<Budget> & { id: string }) => {
      const { data, error } = await supabase
        .from('budgets')
        .update(budget)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Budget updated successfully');
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: (error) => {
      toast.error(`Failed to update budget: ${error.message}`);
    }
  });

  return {
    budgets,
    isLoading,
    error,
    getBudgetDetails,
    createBudget,
    createBudgetEntry,
    updateBudget
  };
};
