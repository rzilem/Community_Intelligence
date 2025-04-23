
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Budget, BudgetEntry } from '@/types/accounting-types';
import { convertToCamelCase, convertToSnakeCase } from '@/components/accounting/budgeting/BudgetPlannerPatch';

export const useBudgets = (associationId?: string) => {
  const queryClient = useQueryClient();

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

      // Convert snake_case to camelCase
      return data.map(convertToCamelCase) as Budget[];
    },
    enabled: !!associationId
  });

  // Create a new budget
  const createBudget = useMutation({
    mutationFn: async (budgetData: Partial<Budget>) => {
      if (!associationId) {
        throw new Error('Association ID is required to create a budget');
      }

      // Convert camelCase to snake_case
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

      // Convert camelCase to snake_case
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

  // Fetch budget entries for a specific budget
  const getBudgetEntries = async (budgetId: string) => {
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

  // Add/update budget entry
  const saveBudgetEntry = useMutation({
    mutationFn: async (entry: any) => {
      // Convert to snake_case for API
      const snakeCaseEntry = {
        budget_id: entry.budget_id,
        gl_account_id: entry.gl_account_id,
        annual_total: entry.annual_total,
        monthly_amounts: JSON.stringify(entry.monthly_amounts),
        previous_year_actual: entry.previous_year_actual,
        previous_year_budget: entry.previous_year_budget,
        notes: entry.notes
      };

      let data;
      let error;

      if (entry.id) {
        // Update existing entry
        const response = await supabase
          .from('gl_budget_entries')
          .update(snakeCaseEntry)
          .eq('id', entry.id)
          .select();
        
        data = response.data;
        error = response.error;
      } else {
        // Insert new entry
        const response = await supabase
          .from('gl_budget_entries')
          .insert(snakeCaseEntry)
          .select();
        
        data = response.data;
        error = response.error;
      }

      if (error) {
        console.error('Error saving budget entry:', error);
        throw error;
      }

      return convertToCamelCase(data![0]);
    },
    onSuccess: (_, variables) => {
      toast.success('Budget entry saved successfully');
      queryClient.invalidateQueries({ queryKey: ['budgetEntries', variables.budget_id] });
    }
  });

  // Delete budget entry
  const deleteBudgetEntry = useMutation({
    mutationFn: async ({ id, budgetId }: { id: string, budgetId: string }) => {
      const { error } = await supabase
        .from('gl_budget_entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting budget entry:', error);
        throw error;
      }

      return id;
    },
    onSuccess: (_, variables) => {
      toast.success('Budget entry deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['budgetEntries', variables.budgetId] });
    }
  });

  return {
    budgets,
    isLoading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetEntries,
    saveBudgetEntry,
    deleteBudgetEntry
  };
};
