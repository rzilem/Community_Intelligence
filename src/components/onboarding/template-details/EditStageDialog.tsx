
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OnboardingStage } from '@/types/onboarding-types';
import StageForm from './stage-dialog/StageForm';
import { useStageDialog } from './stage-dialog/useStageDialog';

interface EditStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: OnboardingStage;
  onSubmit: () => void;
}

const EditStageDialog = ({ open, onOpenChange, stage, onSubmit }: EditStageDialogProps) => {
  const {
    formData,
    isUpdating,
    handleInputChange,
    handleSave
  } = useStageDialog(stage, onSubmit, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Stage</DialogTitle>
        </DialogHeader>
        
        <StageForm 
          formData={formData}
          onInputChange={handleInputChange}
        />
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStageDialog;
