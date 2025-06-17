
import React, { useState } from 'react';
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
import { Loader2 } from 'lucide-react';

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
  const [isDeleting, setIsDeleting] = useState(false);

  if (!association) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(association);
      onOpenChange(false);
    } catch (error) {
      console.error('Error in delete confirmation:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the association "{association.name}". 
            This action cannot be undone and may affect properties, residents, and data associated with this community.
            {association.is_archived && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                This association is already archived/inactive.
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
