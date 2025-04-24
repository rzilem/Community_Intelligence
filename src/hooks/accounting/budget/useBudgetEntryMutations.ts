
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { convertToCamelCase } from '@/components/accounting/budgeting/BudgetPlannerPatch';

export const useBudgetEntryMutations = () => {
  const queryClient = useQueryClient();

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
    saveBudgetEntry,
    deleteBudgetEntry
  };
};
