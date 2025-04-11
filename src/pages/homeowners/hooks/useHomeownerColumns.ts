
import { useState, useEffect } from 'react';

export type HomeownerColumn = {
  id: string;
  label: string;
  defaultVisible?: boolean;
};

export const useHomeownerColumns = (localStorageKey: string = 'homeowner-columns') => {
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
  
  const defaultVisibleIds = defaultColumns.map(col => col.id);

  // Initialize with saved columns from localStorage or defaults
  const getSavedColumns = () => {
    const saved = localStorage.getItem(localStorageKey);
    return saved ? JSON.parse(saved) : defaultVisibleIds;
  };

  const [columns] = useState<HomeownerColumn[]>(defaultColumns);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(getSavedColumns());

  const updateVisibleColumns = (columnIds: string[]) => {
    setVisibleColumnIds(columnIds);
    localStorage.setItem(localStorageKey, JSON.stringify(columnIds));
  };

  const reorderColumns = (startIndex: number, endIndex: number) => {
    const result = Array.from(visibleColumnIds);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setVisibleColumnIds(result);
    localStorage.setItem(localStorageKey, JSON.stringify(result));
  };

  const resetToDefaults = () => {
    setVisibleColumnIds(defaultVisibleIds);
    localStorage.removeItem(localStorageKey);
  };

  return {
    columns,
    visibleColumnIds,
    updateVisibleColumns,
    reorderColumns,
    resetToDefaults,
  };
};
