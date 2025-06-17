
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Association } from '@/types/association-types';

interface AssociationDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  association: Association | null;
  onConfirm: (association: Association) => void;
}

export const AssociationDeleteDialog: React.FC<AssociationDeleteDialogProps> = ({
  open,
  onOpenChange,
  association,
  onConfirm
}) => {
  if (!association) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the association "{association.name}". 
            This action cannot be undone and may affect properties, residents, and data associated with this community.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => onConfirm(association)} 
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
