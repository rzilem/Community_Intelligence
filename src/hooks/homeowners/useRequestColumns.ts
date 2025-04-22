
import { useState, useEffect } from 'react';
import { HOMEOWNER_REQUEST_COLUMNS } from '@/types/homeowner-request-types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const useRequestColumns = () => {
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  
  // Get the default visible columns from the predefined columns
  const defaultVisibleColumns = HOMEOWNER_REQUEST_COLUMNS
    .filter(col => col.defaultVisible)
    .map(col => col.id);
  
  // Use local storage to persist column visibility preferences
  const [savedColumns, setSavedColumns] = useLocalStorage<string[]>(
    'homeowner-request-columns',
    defaultVisibleColumns
  );
  
  // Initialize visible columns from saved preferences or defaults
  useEffect(() => {
    if (savedColumns) {
      setVisibleColumns(savedColumns);
    } else {
      setVisibleColumns(defaultVisibleColumns);
    }
  }, [savedColumns]);

  // Toggle column visibility
  const toggleColumn = (columnId: string) => {
    const newVisibleColumns = visibleColumns.includes(columnId)
      ? visibleColumns.filter(id => id !== columnId)
      : [...visibleColumns, columnId];
    
    setVisibleColumns(newVisibleColumns);
    setSavedColumns(newVisibleColumns);
  };

  return {
    columns: HOMEOWNER_REQUEST_COLUMNS,
    visibleColumns,
    toggleColumn
  };
};
