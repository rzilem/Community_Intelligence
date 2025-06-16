
import { useState, useEffect, useMemo, useCallback } from 'react';
import { getUserColumnPreferences, saveUserColumnPreferences } from '@/services/user/column-preferences-service';
import { useAuth } from '@/contexts/auth';

export type Column = {
  id: string;
  label: string;
  defaultVisible?: boolean;
};

export const useUserColumns = (
  columns: Column[],
  viewId: string
) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Memoize default visible columns to prevent recalculation on every render
  const defaultVisibleIds = useMemo(() => {
    return columns
      .filter(col => col.defaultVisible !== false)
      .map(col => col.id);
  }, [columns]);

  // Memoize the load function to prevent recreation on every render
  const loadUserPreferences = useCallback(async () => {
    if (!user?.id) {
      setVisibleColumnIds(defaultVisibleIds);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data: savedColumns, error: fetchError } = await getUserColumnPreferences(user.id, viewId);
      
      if (fetchError) {
        console.error('Failed to load column preferences:', fetchError);
        setError(fetchError);
        setVisibleColumnIds(defaultVisibleIds);
      } else if (savedColumns && savedColumns.length > 0) {
        setVisibleColumnIds(savedColumns);
      } else {
        setVisibleColumnIds(defaultVisibleIds);
      }
    } catch (error) {
      console.error('Failed to load column preferences:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setVisibleColumnIds(defaultVisibleIds);
    } finally {
      setLoading(false);
    }
  }, [user?.id, viewId, defaultVisibleIds]);

  // Load preferences on mount and when dependencies change
  useEffect(() => {
    loadUserPreferences();
  }, [loadUserPreferences]);

  // Debounced save function to prevent rapid successive calls
  const updateVisibleColumns = useCallback(async (columnIds: string[]) => {
    setVisibleColumnIds(columnIds);
    
    if (!user?.id) {
      // If no user, just use local storage as fallback
      localStorage.setItem(`columns-${viewId}`, JSON.stringify(columnIds));
      return;
    }

    try {
      await saveUserColumnPreferences(user.id, viewId, columnIds);
    } catch (error) {
      console.error('Failed to save column preferences:', error);
      // Don't revert the UI state, just log the error
    }
  }, [user?.id, viewId]);

  const reorderColumns = useCallback(async (startIndex: number, endIndex: number) => {
    const result = Array.from(visibleColumnIds);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    await updateVisibleColumns(result);
  }, [visibleColumnIds, updateVisibleColumns]);

  const resetToDefaults = useCallback(async () => {
    await updateVisibleColumns(defaultVisibleIds);
  }, [defaultVisibleIds, updateVisibleColumns]);

  return {
    columns,
    visibleColumnIds,
    loading,
    error,
    updateVisibleColumns,
    reorderColumns,
    resetToDefaults,
  };
};
