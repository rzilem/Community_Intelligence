
import { useState, useEffect } from 'react';
import { HOMEOWNER_REQUEST_COLUMNS, HomeownerRequestColumn } from '@/types/homeowner-request-types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const useRequestColumns = () => {
  const [visibleColumns, setVisibleColumns] = useState<HomeownerRequestColumn[]>([]);
  
  // Get the default visible columns from the predefined columns
  const defaultVisibleColumns = HOMEOWNER_REQUEST_COLUMNS
    .filter(col => col.defaultVisible);
  
  // Use local storage to persist column visibility preferences
  const [savedColumns, setSavedColumns] = useLocalStorage<HomeownerRequestColumn[]>(
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
    const columnToToggle = HOMEOWNER_REQUEST_COLUMNS.find(col => col.id === columnId);
    if (!columnToToggle) return;
    
    const isVisible = visibleColumns.some(col => col.id === columnId);
    
    const newVisibleColumns = isVisible
      ? visibleColumns.filter(col => col.id !== columnId)
      : [...visibleColumns, columnToToggle];
    
    setVisibleColumns(newVisibleColumns);
    setSavedColumns(newVisibleColumns);
  };

  return {
    columns: HOMEOWNER_REQUEST_COLUMNS,
    visibleColumns,
    toggleColumn
  };
};
