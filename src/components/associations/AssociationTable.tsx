
import React from 'react';
import { Association } from '@/types/association-types';
import AssociationEditDialog from './AssociationEditDialog';
import { AssociationDeleteDialog } from './table/dialogs/AssociationDeleteDialog';
import AssociationTableLayout from './table/AssociationTableLayout';
import { useAssociationTable } from '@/hooks/associations/useAssociationTable';

interface AssociationTableProps {
  associations: Association[];
  isLoading: boolean;
  onEdit?: (id: string, data: Partial<Association>) => void;
  onDelete?: (id: string) => void;
  onToggleSelect?: (association: Association) => void;
  selectedAssociations?: Association[];
  onViewProfile?: (id: string) => void;
}

const AssociationTable: React.FC<AssociationTableProps> = ({ 
  associations, 
  isLoading, 
  onEdit,
  onDelete,
  onToggleSelect,
  selectedAssociations = [],
  onViewProfile
}) => {
  const {
    visibleColumns,
    deleteDialogOpen,
    editDialogOpen,
    selectedAssociation,
    setDeleteDialogOpen,
    setEditDialogOpen,
    handleColumnsChange,
    handleReorderColumns,
    handleEditClick,
    handleDeleteClick,
    handleSaveEdit,
    handleConfirmDelete,
    isSelected,
    handleSelectAll
  } = useAssociationTable({
    onEdit,
    onDelete,
    selectedAssociations,
    onToggleSelect
  });

  return (
    <>
      <AssociationTableLayout
        associations={associations}
        isLoading={isLoading}
        visibleColumns={visibleColumns}
        selectedAssociations={selectedAssociations}
        showSelection={!!onToggleSelect}
        onColumnsChange={handleColumnsChange}
        onReorderColumns={handleReorderColumns}
        onSelectAll={() => handleSelectAll(associations)}
        onToggleSelect={onToggleSelect}
        onViewProfile={onViewProfile}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        isSelected={isSelected}
      />

      <AssociationDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        association={selectedAssociation}
        onConfirm={handleConfirmDelete}
      />

      {selectedAssociation && (
        <AssociationEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          association={selectedAssociation}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
};

export default AssociationTable;
