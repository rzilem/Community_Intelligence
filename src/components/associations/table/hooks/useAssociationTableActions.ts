
import { Association } from '@/types/association-types';

interface UseAssociationTableActionsProps {
  onEdit?: (id: string, data: Partial<Association>) => void;
  onDelete?: (id: string) => void;
  setSelectedAssociation: (association: Association | null) => void;
  setEditDialogOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
}

export const useAssociationTableActions = ({
  onEdit,
  onDelete,
  setSelectedAssociation,
  setEditDialogOpen,
  setDeleteDialogOpen
}: UseAssociationTableActionsProps) => {
  const handleEditClick = (association: Association) => {
    setSelectedAssociation(association);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (association: Association) => {
    setSelectedAssociation(association);
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = (data: Partial<Association>, association: Association) => {
    if (onEdit) {
      onEdit(association.id, data);
    }
    setEditDialogOpen(false);
  };

  const handleConfirmDelete = (association: Association) => {
    if (onDelete) {
      onDelete(association.id);
    }
    setDeleteDialogOpen(false);
  };

  return {
    handleEditClick,
    handleDeleteClick,
    handleSaveEdit,
    handleConfirmDelete
  };
};
