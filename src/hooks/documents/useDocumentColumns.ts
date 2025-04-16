
import { useState } from 'react';
import { useUserColumns } from '@/hooks/useUserColumns';

export type DocumentColumn = {
  id: string;
  label: string;
  defaultVisible?: boolean;
};

export const useDocumentColumns = (viewId: string = 'document-columns') => {
  const defaultColumns: DocumentColumn[] = [
    { id: 'name', label: 'Document Name', defaultVisible: true },
    { id: 'category', label: 'Category', defaultVisible: true },
    { id: 'created_at', label: 'Upload Date', defaultVisible: true },
    { id: 'description', label: 'Description', defaultVisible: true },
    { id: 'file_size', label: 'Size', defaultVisible: true },
    { id: 'file_type', label: 'Type', defaultVisible: false },
    { id: 'uploaded_by', label: 'Uploaded By', defaultVisible: false },
    { id: 'last_accessed', label: 'Last Accessed', defaultVisible: false },
  ];
  
  const [columns] = useState<DocumentColumn[]>(defaultColumns);
  
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
