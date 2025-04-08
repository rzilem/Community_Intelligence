
import { useState, useEffect } from 'react';

export interface ColumnDef {
  id: string;
  label: string;
  accessorKey?: string;
  defaultVisible?: boolean;
}

export const useTableColumns = <T extends Record<string, any>>(
  defaultColumns: ColumnDef[],
  storageKey: string
) => {
  // Load columns and their order from localStorage
  const [columns, setColumns] = useState<ColumnDef[]>(() => {
    // Try to load saved column preferences from localStorage
    const savedColumns = localStorage.getItem(storageKey);
    if (savedColumns) {
      try {
        return JSON.parse(savedColumns);
      } catch (e) {
        console.error('Failed to parse saved columns', e);
      }
    }
    return defaultColumns;
  });

  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() => {
    // Try to load saved visibility preferences from localStorage
    const savedVisibility = localStorage.getItem(`${storageKey}-visibility`);
    if (savedVisibility) {
      try {
        return JSON.parse(savedVisibility);
      } catch (e) {
        console.error('Failed to parse saved visibility', e);
      }
    }
    // Set default visible columns
    return columns
      .filter(col => col.defaultVisible !== false)
      .map(col => col.id);
  });

  // Save column preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(columns));
    localStorage.setItem(`${storageKey}-visibility`, JSON.stringify(visibleColumnIds));
  }, [visibleColumnIds, columns, storageKey]);

  const updateVisibleColumns = (columnIds: string[]) => {
    // Ensure at least one column is visible
    if (columnIds.length === 0) {
      return;
    }
    setVisibleColumnIds(columnIds);
  };

  // New function to reorder columns
  const reorderColumns = (sourceIndex: number, destinationIndex: number) => {
    const reorderedColumns = [...columns];
    const [removed] = reorderedColumns.splice(sourceIndex, 1);
    reorderedColumns.splice(destinationIndex, 0, removed);
    setColumns(reorderedColumns);
  };

  const resetToDefaults = () => {
    setColumns(defaultColumns);
    setVisibleColumnIds(defaultColumns
      .filter(col => col.defaultVisible !== false)
      .map(col => col.id));
  };

  return {
    columns,
    visibleColumnIds,
    updateVisibleColumns,
    reorderColumns,
    resetToDefaults
  };
};
