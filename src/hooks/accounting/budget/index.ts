
export * from './useBudgetQueries';
export * from './useBudgetMutations';
export * from './useBudgetEntryMutations';

// Combined hook for convenience
import { useBudgetQueries, getBudgetEntries } from './useBudgetQueries';
import { useBudgetMutations } from './useBudgetMutations';
import { useBudgetEntryMutations } from './useBudgetEntryMutations';

export const useBudgets = (associationId?: string) => {
  const { budgets, isLoading, error } = useBudgetQueries(associationId);
  const { createBudget, updateBudget, deleteBudget } = useBudgetMutations(associationId);
  const { saveBudgetEntry, deleteBudgetEntry } = useBudgetEntryMutations();

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
