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
        .from('gl_budgets')
        .select('*')
        .eq('association_id', associationId)
        .order('year', { ascending: false });
      
      if (error) throw error;
      
      // Convert from snake_case to camelCase
      return (data || []).map(budget => ({
        id: budget.id,
        name: budget.name,
        year: budget.year,
        status: budget.status,
        totalRevenue: budget.total_revenue || 0,
        totalExpenses: budget.total_expenses || 0,
        createdBy: budget.created_by,
        createdAt: budget.created_at,
        description: budget.description,
        associationId: budget.association_id,
        fundType: budget.fund_type
      }));
    },
    enabled: !!associationId
  });

  const getBudgetDetails = async (budgetId: string) => {
    try {
      // Get budget
      const { data: budget, error: budgetError } = await supabase
        .from('gl_budgets')
        .select('*')
        .eq('id', budgetId)
        .single();
      
      if (budgetError) throw budgetError;
      
      // Get budget entries
      const { data: entries, error: entriesError } = await supabase
        .from('gl_budget_entries')
        .select(`
          *,
          gl_account:gl_account_id (id, code, name, type, category)
        `)
        .eq('budget_id', budgetId);
      
      if (entriesError) throw entriesError;
      
      // Convert from snake_case to camelCase
      const formattedBudget: Budget = {
        id: budget.id,
        name: budget.name,
        year: budget.year,
        status: budget.status,
        totalRevenue: budget.total_revenue || 0,
        totalExpenses: budget.total_expenses || 0,
        createdBy: budget.created_by,
        createdAt: budget.created_at,
        description: budget.description,
        associationId: budget.association_id,
        fundType: budget.fund_type,
        entries: entries ? entries.map((entry: any) => ({
          id: entry.id,
          glAccountId: entry.gl_account_id,
          monthlyAmounts: entry.monthly_amounts || [],
          annualTotal: entry.annual_total || 0,
          previousYearActual: entry.previous_year_actual,
          previousYearBudget: entry.previous_year_budget,
          notes: entry.notes,
          gl_account: entry.gl_account
        })) : []
      };
      
      return formattedBudget;
    } catch (error) {
      console.error('Error fetching budget details:', error);
      throw error;
    }
  };

  const createBudget = useMutation({
    mutationFn: async (budget: Partial<Budget>) => {
      // Convert camelCase JS properties to snake_case db fields
      const dbBudget = {
        name: budget.name,
        year: budget.year,
        status: budget.status,
        total_revenue: budget.totalRevenue,
        total_expenses: budget.totalExpenses,
        description: budget.description,
        association_id: budget.associationId,
        fund_type: budget.fundType
      };
      
      const { data, error } = await supabase
        .from('gl_budgets')
        .insert(dbBudget)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as Budget;
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
      // Convert camelCase JS properties to snake_case db fields
      const dbEntry = {
        budget_id: entry.budget_id, // Keep this as snake_case for compatibility
        gl_account_id: entry.glAccountId,
        annual_total: entry.annualTotal,
        monthly_amounts: entry.monthlyAmounts,
        previous_year_actual: entry.previousYearActual,
        previous_year_budget: entry.previousYearBudget,
        notes: entry.notes
      };
      
      const { data, error } = await supabase
        .from('gl_budget_entries')
        .insert(dbEntry)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as BudgetEntry;
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
      // Convert camelCase JS properties to snake_case db fields
      const dbBudget = {
        name: budget.name,
        year: budget.year,
        status: budget.status,
        total_revenue: budget.totalRevenue,
        total_expenses: budget.totalExpenses,
        description: budget.description,
        fund_type: budget.fundType
      };
      
      const { data, error } = await supabase
        .from('gl_budgets')
        .update(dbBudget)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as Budget;
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
