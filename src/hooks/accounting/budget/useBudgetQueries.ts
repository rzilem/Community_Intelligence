
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Budget, BudgetEntry } from '@/types/accounting-types';
import { convertToCamelCase } from '@/components/accounting/budgeting/BudgetPlannerPatch';

export const useBudgetQueries = (associationId?: string) => {
  // Fetch all budgets for an association
  const { data: budgets, isLoading, error } = useQuery({
    queryKey: ['budgets', associationId],
    queryFn: async () => {
      if (!associationId) {
        return [];
      }

      const { data, error } = await supabase
        .from('gl_budgets')
        .select('*')
        .eq('association_id', associationId)
        .order('year', { ascending: false });

      if (error) {
        console.error('Error fetching budgets:', error);
        throw error;
      }

      return data.map(convertToCamelCase) as Budget[];
    },
    enabled: !!associationId
  });

  return {
    budgets,
    isLoading,
    error
  };
};

export const getBudgetEntries = async (budgetId: string): Promise<BudgetEntry[]> => {
  const { data, error } = await supabase
    .from('gl_budget_entries')
    .select(`
      *,
      gl_account:gl_account_id (*)
    `)
    .eq('budget_id', budgetId);

  if (error) {
    console.error('Error fetching budget entries:', error);
    throw error;
  }

  return data.map(convertToCamelCase) as BudgetEntry[];
};
