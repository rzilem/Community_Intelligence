
import { useState, useEffect } from 'react';
import { Association } from '@/types/association-types';
import { DEFAULT_VISIBLE_COLUMNS } from '@/components/associations/table/config/association-table-columns';

interface UseAssociationTableProps {
  onEdit?: (id: string, data: Partial<Association>) => void;
  onDelete?: (id: string) => void;
  selectedAssociations?: Association[];
  onToggleSelect?: (association: Association) => void;
}

export const useAssociationTable = ({
  onEdit,
  onDelete,
  selectedAssociations = [],
  onToggleSelect
}: UseAssociationTableProps = {}) => {
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

  const handleEditClick = (association: Association) => {
    setSelectedAssociation(association);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (association: Association) => {
    setSelectedAssociation(association);
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = (data: Partial<Association>) => {
    if (onEdit && selectedAssociation) {
      onEdit(selectedAssociation.id, data);
    }
    setEditDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (onDelete && selectedAssociation) {
      onDelete(selectedAssociation.id);
    }
    setDeleteDialogOpen(false);
  };

  const isSelected = (association: Association) => {
    return selectedAssociations.some(a => a.id === association.id);
  };

  const handleSelectAll = (associations: Association[]) => {
    if (selectedAssociations.length === associations.length) {
      // Deselect all
      associations.forEach(association => {
        if (onToggleSelect && isSelected(association)) {
          onToggleSelect(association);
        }
      });
    } else {
      // Select all
      associations.forEach(association => {
        if (onToggleSelect && !isSelected(association)) {
          onToggleSelect(association);
        }
      });
    }
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
    handleReorderColumns,
    handleEditClick,
    handleDeleteClick,
    handleSaveEdit,
    handleConfirmDelete,
    isSelected,
    handleSelectAll
  };
};
