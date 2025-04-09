
import { useState } from 'react';
import { Lead } from '@/types/lead-types';

type LeadColumn = {
  id: string;
  label: string;
  accessorKey?: keyof Lead;
  width?: number;
  defaultVisible?: boolean;
};

export const useTableColumns = (
  columnDefinitions: LeadColumn[] = [], 
  localStorageKey?: string
) => {
  // If no column definitions are provided, use these default columns
  const defaultColumns: LeadColumn[] = columnDefinitions.length > 0 ? columnDefinitions : [
    { id: 'name', label: 'Name', accessorKey: 'name' },
    { id: 'email', label: 'Email', accessorKey: 'email' },
    { id: 'association_name', label: 'Association', accessorKey: 'association_name' },
    { id: 'association_type', label: 'Association Type', accessorKey: 'association_type' },
    { id: 'number_of_units', label: 'Units', accessorKey: 'number_of_units' },
    { id: 'city', label: 'City', accessorKey: 'city' },
    { id: 'state', label: 'State', accessorKey: 'state' },
    { id: 'status', label: 'Status', accessorKey: 'status' },
    { id: 'source', label: 'Source', accessorKey: 'source' },
    { id: 'created_at', label: 'Created', accessorKey: 'created_at' }
  ];
  
  // Get default visible columns from the definitions or use a default set
  const defaultVisibleIds = columnDefinitions.length > 0 
    ? columnDefinitions
        .filter(col => col.defaultVisible !== false)
        .map(col => col.id)
    : [
        'name', 'association_name', 'association_type', 'number_of_units', 
        'city', 'status', 'source', 'created_at'
      ];

  const [columns] = useState<LeadColumn[]>(defaultColumns);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(defaultVisibleIds);

  const updateVisibleColumns = (columnIds: string[]) => {
    setVisibleColumnIds(columnIds);
    if (localStorageKey) {
      localStorage.setItem(localStorageKey, JSON.stringify(columnIds));
    }
  };

  const reorderColumns = (startIndex: number, endIndex: number) => {
    const result = Array.from(visibleColumnIds);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setVisibleColumnIds(result);
    if (localStorageKey) {
      localStorage.setItem(localStorageKey, JSON.stringify(result));
    }
  };

  const resetToDefaults = () => {
    setVisibleColumnIds(defaultVisibleIds);
    if (localStorageKey) {
      localStorage.removeItem(localStorageKey);
    }
  };

  return {
    columns,
    visibleColumnIds,
    updateVisibleColumns,
    reorderColumns,
    resetToDefaults,
  };
};
