
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

  useEffect(() => {
    const loadUserPreferences = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          const { data: savedColumns } = await getUserColumnPreferences(user.id, viewId);
          if (savedColumns && savedColumns.length > 0) {
            setVisibleColumnIds(savedColumns);
          } else {
            setVisibleColumnIds(defaultVisibleIds);
          }
        } catch (error) {
          console.error('Failed to load column preferences:', error);
          setVisibleColumnIds(defaultVisibleIds);
        } finally {
          setLoading(false);
        }
      } else {
        setVisibleColumnIds(defaultVisibleIds);
        setLoading(false);
      }
    };

    loadUserPreferences();
  }, [user?.id, viewId]);

  const updateVisibleColumns = async (columnIds: string[]) => {
    setVisibleColumnIds(columnIds);
    
    if (user?.id) {
      await saveUserColumnPreferences(user.id, viewId, columnIds);
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
      await saveUserColumnPreferences(user.id, viewId, result);
    } else {
      localStorage.setItem(`columns-${viewId}`, JSON.stringify(result));
    }
  };

  const resetToDefaults = async () => {
    setVisibleColumnIds(defaultVisibleIds);
    
    if (user?.id) {
      await saveUserColumnPreferences(user.id, viewId, defaultVisibleIds);
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
