
import { useState, useEffect } from 'react';
import { Association } from '@/types/association-types';
import { DEFAULT_VISIBLE_COLUMNS } from '../config/association-table-columns';

export const useAssociationTableState = () => {
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_VISIBLE_COLUMNS);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState<Association | null>(null);

  // Load column preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('associationTableColumns');
    if (saved) {
      try {
        setVisibleColumns(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load column preferences:', error);
      }
    }
  }, []);

  const handleColumnsChange = (columns: string[]) => {
    setVisibleColumns(columns);
    localStorage.setItem('associationTableColumns', JSON.stringify(columns));
  };

  const handleReorderColumns = (sourceIndex: number, destinationIndex: number) => {
    const orderedColumns = [...visibleColumns];
    const [removed] = orderedColumns.splice(sourceIndex, 1);
    orderedColumns.splice(destinationIndex, 0, removed);
    setVisibleColumns(orderedColumns);
    localStorage.setItem('associationTableColumns', JSON.stringify(orderedColumns));
  };

  return {
    visibleColumns,
    deleteDialogOpen,
    editDialogOpen,
    selectedAssociation,
    setDeleteDialogOpen,
    setEditDialogOpen,
    setSelectedAssociation,
    handleColumnsChange,
    handleReorderColumns
  };
};
