
import React from 'react';
import { Association } from '@/types/association-types';
import AssociationEditDialog from './AssociationEditDialog';
import { AssociationDeleteDialog } from './table/dialogs/AssociationDeleteDialog';
import AssociationTableLayout from './table/AssociationTableLayout';
import { useAssociationTable } from '@/hooks/associations/useAssociationTable';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AssociationTableProps {
  associations: Association[];
  isLoading: boolean;
  onEdit?: (id: string, data: Partial<Association>) => void;
  onDelete?: (id: string) => void;
  onToggleSelect?: (association: Association) => void;
  selectedAssociations?: Association[];
  onViewProfile?: (id: string) => void;
  onRefresh?: () => void;
}

const AssociationTable: React.FC<AssociationTableProps> = ({ 
  associations, 
  isLoading, 
  onEdit,
  onDelete,
  onToggleSelect,
  selectedAssociations = [],
  onViewProfile,
  onRefresh
}) => {
  const navigate = useNavigate();
  
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
    onDelete: async (id: string) => {
      try {
        await onDelete?.(id);
        // Refresh the data after successful deletion
        if (onRefresh) {
          onRefresh();
        }
        
        // Navigate away from the deleted association's profile page
        const currentPath = window.location.pathname;
        if (currentPath.includes(`/system/associations/${id}`)) {
          navigate('/system/data-management');
          toast.success('Association deleted successfully. Redirected to data management.');
        } else {
          toast.success('Association deleted successfully');
        }
      } catch (error: any) {
        console.error('Failed to delete association:', error);
        toast.error(`Failed to delete association: ${error.message}`);
      }
    },
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
