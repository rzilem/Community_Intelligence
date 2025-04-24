
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Budget } from '@/types/accounting-types';
import { convertToCamelCase, convertToSnakeCase } from '@/components/accounting/budgeting/BudgetPlannerPatch';

export const useBudgetMutations = (associationId?: string) => {
  const queryClient = useQueryClient();

  // Create a new budget
  const createBudget = useMutation({
    mutationFn: async (budgetData: Partial<Budget>) => {
      if (!associationId) {
        throw new Error('Association ID is required to create a budget');
      }

      const snakeCaseBudget = convertToSnakeCase({
        ...budgetData,
        association_id: associationId
      });

      const { data, error } = await supabase
        .from('gl_budgets')
        .insert(snakeCaseBudget)
        .select();

      if (error) {
        console.error('Error creating budget:', error);
        throw error;
      }

      return convertToCamelCase(data[0]) as Budget;
    },
    onSuccess: () => {
      toast.success('Budget created successfully');
      queryClient.invalidateQueries({ queryKey: ['budgets', associationId] });
    }
  });

  // Update an existing budget
  const updateBudget = useMutation({
    mutationFn: async (budget: Partial<Budget>) => {
      if (!budget.id) {
        throw new Error('Budget ID is required');
      }

      // Ensure status is one of the allowed values
      let status = budget.status;
      if (budget.status && !['draft', 'approved', 'final'].includes(budget.status)) {
        status = 'draft';
      }

      // Ensure fundType is one of the allowed values
      let fundType = budget.fundType;
      if (budget.fundType && !['operating', 'reserve', 'capital'].includes(budget.fundType)) {
        fundType = 'operating';
      }

      const snakeCaseBudget = convertToSnakeCase({
        ...budget,
        status,
        fund_type: fundType
      });

      const { data, error } = await supabase
        .from('gl_budgets')
        .update(snakeCaseBudget)
        .eq('id', budget.id)
        .select();

      if (error) {
        console.error('Error updating budget:', error);
        throw error;
      }

      return convertToCamelCase(data[0]) as Budget;
    },
    onSuccess: () => {
      toast.success('Budget updated successfully');
      queryClient.invalidateQueries({ queryKey: ['budgets', associationId] });
    }
  });

  // Delete a budget
  const deleteBudget = useMutation({
    mutationFn: async (budgetId: string) => {
      // First delete all budget entries
      const { error: entriesError } = await supabase
        .from('gl_budget_entries')
        .delete()
        .eq('budget_id', budgetId);

      if (entriesError) {
        console.error('Error deleting budget entries:', entriesError);
        throw entriesError;
      }

      // Then delete the budget
      const { error } = await supabase
        .from('gl_budgets')
        .delete()
        .eq('id', budgetId);

      if (error) {
        console.error('Error deleting budget:', error);
        throw error;
      }

      return budgetId;
    },
    onSuccess: () => {
      toast.success('Budget deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['budgets', associationId] });
    }
  });

  return {
    createBudget,
    updateBudget,
    deleteBudget
  };
};
