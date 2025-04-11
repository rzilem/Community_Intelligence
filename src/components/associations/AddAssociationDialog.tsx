
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AssociationForm, { AssociationFormData } from '@/components/associations/AssociationForm';

export interface AddAssociationDialogProps {
  isCreating: boolean;
  onSave: (data: AssociationFormData) => void;
}

// Rename the component to match the export name
export const AddAssociationDialog: React.FC<AddAssociationDialogProps> = ({ isCreating, onSave }) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleSave = (data: AssociationFormData) => {
    onSave(data);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
          onClose={() => setIsDialogOpen(false)} 
          onSave={handleSave}
          isSubmitting={isCreating}
        />
      </DialogContent>
    </Dialog>
  );
};

// Add a default export as well for compatibility
export default AddAssociationDialog;
