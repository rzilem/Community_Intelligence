
import { useState } from 'react';
import { useUserColumns } from '@/hooks/useUserColumns';

export type HomeownerColumn = {
  id: string;
  label: string;
  defaultVisible?: boolean;
};

export const useHomeownerColumns = (viewId: string = 'homeowner-columns') => {
  const defaultColumns: HomeownerColumn[] = [
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    { id: 'propertyAddress', label: 'Street Address' },
    { id: 'association', label: 'Association' },
    { id: 'status', label: 'Status' },
    { id: 'type', label: 'Type' },
    { id: 'lastPaymentDate', label: 'Last Payment Date' },
    { id: 'closingDate', label: 'Closing Date' }
  ];
  
  const [columns] = useState<HomeownerColumn[]>(defaultColumns);
  
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
