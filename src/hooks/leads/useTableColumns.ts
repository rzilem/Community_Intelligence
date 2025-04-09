
import { useState } from 'react';
import { Lead } from '@/types/lead-types';

type LeadColumn = {
  id: string;
  label: string;
  accessorKey?: keyof Lead;
  width?: number;
};

export const useTableColumns = () => {
  const defaultColumns: LeadColumn[] = [
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

  const [columns] = useState<LeadColumn[]>(defaultColumns);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([
    'name', 'association_name', 'association_type', 'number_of_units', 
    'city', 'status', 'source', 'created_at'
  ]);

  const updateVisibleColumns = (columnIds: string[]) => {
    setVisibleColumnIds(columnIds);
  };

  const reorderColumns = (startIndex: number, endIndex: number) => {
    const result = Array.from(visibleColumnIds);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setVisibleColumnIds(result);
  };

  const resetToDefaults = () => {
    setVisibleColumnIds([
      'name', 'association_name', 'association_type', 'number_of_units', 
      'city', 'status', 'source', 'created_at'
    ]);
  };

  return {
    columns,
    visibleColumnIds,
    updateVisibleColumns,
    reorderColumns,
    resetToDefaults,
  };
};
