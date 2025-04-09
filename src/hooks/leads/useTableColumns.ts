import { useState } from 'react';
import { Lead } from '@/types/lead-types';

export type LeadColumn = {
  id: string;
  label: string;
  accessorKey?: keyof Lead | string;
  width?: number;
  defaultVisible?: boolean;
};

export const useTableColumns = (
  columnDefinitions: LeadColumn[] = [], 
  localStorageKey?: string
) => {
  const defaultColumns: LeadColumn[] = columnDefinitions.length > 0 ? columnDefinitions : [
    { id: 'name', label: 'Name', accessorKey: 'name' },
    { id: 'association_name', label: 'Association Name', accessorKey: 'association_name' },
    { id: 'association_type', label: 'Association Type', accessorKey: 'association_type' },
    { id: 'number_of_units', label: 'Units', accessorKey: 'number_of_units' },
    { id: 'email', label: 'Email', accessorKey: 'email' },
    { id: 'city', label: 'City', accessorKey: 'city' },
    { id: 'phone', label: 'Phone', accessorKey: 'phone' },
    { id: 'street_address', label: 'Address', accessorKey: 'street_address' },
    { id: 'status', label: 'Status', accessorKey: 'status' },
    { id: 'source', label: 'Source', accessorKey: 'source' },
    { id: 'created_at', label: 'Created', accessorKey: 'created_at' }
  ];
  
  const defaultVisibleIds = columnDefinitions.length > 0 
    ? columnDefinitions
        .filter(col => col.defaultVisible !== false)
        .map(col => col.id)
    : [
        'name', 'association_name', 'association_type', 'number_of_units', 
        'email', 'city', 'phone', 'status', 'source', 'created_at'
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
