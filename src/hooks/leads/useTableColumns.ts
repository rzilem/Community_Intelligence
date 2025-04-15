
import { useState, useEffect } from 'react';
import { Lead } from '@/types/lead-types';
import { useUserColumns } from '@/hooks/useUserColumns';

export type LeadColumn = {
  id: string;
  label: string;
  accessorKey?: keyof Lead | string;
  width?: number;
  defaultVisible?: boolean;
};

export const useTableColumns = (
  columnDefinitions: LeadColumn[] = [], 
  viewId: string = 'leads-table'
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
  
  const [columns] = useState<LeadColumn[]>(defaultColumns);
  
  const { 
    visibleColumnIds, 
    updateVisibleColumns, 
    reorderColumns, 
    resetToDefaults,
    loading 
  } = useUserColumns(
    defaultColumns, 
    viewId
  );

  return {
    columns,
    visibleColumnIds,
    loading,
    updateVisibleColumns,
    reorderColumns,
    resetToDefaults,
  };
};
