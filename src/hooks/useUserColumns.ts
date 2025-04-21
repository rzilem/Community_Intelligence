
import { useState, useEffect, useMemo } from 'react';
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
  const [error, setError] = useState<Error | null>(null);
  const [isFetched, setIsFetched] = useState(false);
  
  // Memoize default visible columns to prevent recalculations
  const defaultVisibleIds = useMemo(() => 
    columns.filter(col => col.defaultVisible !== false).map(col => col.id)
  , [columns]);

  // Load column preferences only once when component mounts or user/viewId changes
  useEffect(() => {
    // Skip if already fetched
    if (isFetched) return;
    
    const loadUserPreferences = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (user?.id) {
          console.log(`Loading column preferences for user ${user.id}, view ${viewId}`);
          
          const { data: savedColumns, error: prefError } = await getUserColumnPreferences(user.id, viewId);
          
          if (prefError) {
            console.error('Error loading column preferences:', prefError);
            setVisibleColumnIds(defaultVisibleIds);
          } else if (savedColumns && savedColumns.length > 0) {
            console.log('Loaded saved columns for view', viewId, savedColumns);
            setVisibleColumnIds(savedColumns);
          } else {
            console.log('No saved columns found, using defaults for view', viewId);
            setVisibleColumnIds(defaultVisibleIds);
          }
        } else {
          // Fallback to localStorage when user is not authenticated
          try {
            const saved = localStorage.getItem(`columns-${viewId}`);
            if (saved) {
              const savedColumns = JSON.parse(saved);
              if (Array.isArray(savedColumns) && savedColumns.length > 0) {
                setVisibleColumnIds(savedColumns);
              } else {
                setVisibleColumnIds(defaultVisibleIds);
              }
            } else {
              setVisibleColumnIds(defaultVisibleIds);
            }
          } catch (error) {
            console.error('Error loading columns from localStorage:', error);
            setVisibleColumnIds(defaultVisibleIds);
          }
        }
        
        // Mark as fetched so we don't repeat unnecessarily
        setIsFetched(true);
      } catch (err: any) {
        console.error('Unexpected error in useUserColumns:', err);
        setError(err);
        setVisibleColumnIds(defaultVisibleIds);
      } finally {
        setLoading(false);
      }
    };

    loadUserPreferences();
  }, [user?.id, viewId, defaultVisibleIds, isFetched]);

  const updateVisibleColumns = async (columnIds: string[]) => {
    if (!columnIds || columnIds.length === 0) {
      console.warn('Attempted to update with empty column list, using defaults instead');
      columnIds = defaultVisibleIds;
    }
    
    console.log('Updating visible columns for view', viewId, columnIds);
    setVisibleColumnIds(columnIds);
    
    if (user?.id) {
      try {
        await saveUserColumnPreferences(user.id, viewId, columnIds);
        console.log('Column preferences saved successfully to database');
      } catch (error) {
        console.error('Failed to save column preferences to database:', error);
      }
    }
    
    // Always save to localStorage as a fallback
    try {
      localStorage.setItem(`columns-${viewId}`, JSON.stringify(columnIds));
      console.log('Column preferences saved to localStorage');
    } catch (error) {
      console.error('Failed to save column preferences to localStorage:', error);
    }
  };

  const reorderColumns = async (startIndex: number, endIndex: number) => {
    const result = Array.from(visibleColumnIds);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    await updateVisibleColumns(result);
  };

  const resetToDefaults = async () => {
    await updateVisibleColumns(defaultVisibleIds);
  };

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
