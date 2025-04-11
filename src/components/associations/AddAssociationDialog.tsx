
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AssociationForm, { AssociationFormData } from '@/components/associations/AssociationForm';
import { useDialog } from '@/hooks/ui/useDialog';

export interface AddAssociationDialogProps {
  isCreating: boolean;
  onSave: (data: AssociationFormData) => void;
}

export const AddAssociationDialog: React.FC<AddAssociationDialogProps> = ({ 
  isCreating, 
  onSave 
}) => {
  const dialog = useDialog(false);

  const handleSave = (data: AssociationFormData) => {
    onSave(data);
    dialog.close();
  };

  return (
    <Dialog open={dialog.isOpen} onOpenChange={dialog.setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add Association
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Association</DialogTitle>
          <DialogDescription>
            Create a new community association or organization to manage.
          </DialogDescription>
        </DialogHeader>
        <AssociationForm 
          onClose={dialog.close} 
          onSave={handleSave}
          isSubmitting={isCreating}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddAssociationDialog;
