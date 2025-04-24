
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import StageForm from './stage-dialog/StageForm';

interface StageFormData {
  name: string;
  description: string;
  estimated_days: number;
}

interface AddStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: StageFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: () => void;
}

const AddStageDialog = ({ 
  open, 
  onOpenChange, 
  formData,
  onInputChange,
  onSubmit 
}: AddStageDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Stage</DialogTitle>
        </DialogHeader>
        
        <StageForm 
          formData={formData}
          onInputChange={onInputChange}
        />
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            Add Stage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddStageDialog;
