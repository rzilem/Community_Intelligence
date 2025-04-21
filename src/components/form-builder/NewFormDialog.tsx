import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { NewFormDialogProps } from '@/types/form-builder-types';

export const NewFormDialog: React.FC<NewFormDialogProps> = ({ 
  open, 
  onOpenChange,
  associationId 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Form</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          {associationId ? (
            <p>Creating form for association: {associationId}</p>
          ) : (
            <p className="text-amber-500">Please select an association first</p>
          )}
          {/* Form content will go here */}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={!associationId}>Create Form</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
