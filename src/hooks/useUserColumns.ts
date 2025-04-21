
import { useState, useEffect } from 'react';
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
  
  // Default visible columns are all columns unless specified
  const defaultVisibleIds = columns
    .filter(col => col.defaultVisible !== false)
    .map(col => col.id);

  // Load column preferences when component mounts or user/viewId changes
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          const { data: savedColumns } = await getUserColumnPreferences(user.id, viewId);
          
          if (savedColumns && savedColumns.length > 0) {
            console.log('Loaded saved columns for view', viewId, savedColumns);
            setVisibleColumnIds(savedColumns);
          } else {
            console.log('No saved columns found, using defaults for view', viewId);
            setVisibleColumnIds(defaultVisibleIds);
          }
        } catch (error) {
          console.error('Failed to load column preferences:', error);
          setVisibleColumnIds(defaultVisibleIds);
        } finally {
          setLoading(false);
        }
      } else {
        // Fallback to localStorage when user is not authenticated
        try {
          const saved = localStorage.getItem(`columns-${viewId}`);
          if (saved) {
            const savedColumns = JSON.parse(saved);
            setVisibleColumnIds(savedColumns);
          } else {
            setVisibleColumnIds(defaultVisibleIds);
          }
        } catch (error) {
          console.error('Error loading columns from localStorage:', error);
          setVisibleColumnIds(defaultVisibleIds);
        }
        setLoading(false);
      }
    };

    loadUserPreferences();
  }, [user?.id, viewId, defaultVisibleIds]);

  const updateVisibleColumns = async (columnIds: string[]) => {
    console.log('Updating visible columns for view', viewId, columnIds);
    setVisibleColumnIds(columnIds);
    
    if (user?.id) {
      try {
        await saveUserColumnPreferences(user.id, viewId, columnIds);
        console.log('Column preferences saved successfully');
      } catch (error) {
        console.error('Failed to save column preferences:', error);
      }
    } else {
      // If no user, just use local storage as fallback
      localStorage.setItem(`columns-${viewId}`, JSON.stringify(columnIds));
    }
  };

  const reorderColumns = async (startIndex: number, endIndex: number) => {
    const result = Array.from(visibleColumnIds);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    setVisibleColumnIds(result);
    
    if (user?.id) {
      try {
        await saveUserColumnPreferences(user.id, viewId, result);
      } catch (error) {
        console.error('Failed to save column preferences after reordering:', error);
      }
    } else {
      localStorage.setItem(`columns-${viewId}`, JSON.stringify(result));
    }
  };

  const resetToDefaults = async () => {
    setVisibleColumnIds(defaultVisibleIds);
    
    if (user?.id) {
      try {
        await saveUserColumnPreferences(user.id, viewId, defaultVisibleIds);
      } catch (error) {
        console.error('Failed to reset column preferences to defaults:', error);
      }
    } else {
      localStorage.removeItem(`columns-${viewId}`);
    }
  };

  return {
    columns,
    visibleColumnIds,
    loading,
    updateVisibleColumns,
    reorderColumns,
    resetToDefaults,
  };
};
