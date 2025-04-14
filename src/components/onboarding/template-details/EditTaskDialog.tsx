
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OnboardingTask } from '@/types/onboarding-types';
import TaskForm from './task-dialog/TaskForm';
import { useTaskDialog } from './task-dialog/useTaskDialog';

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: OnboardingTask;
  onSubmit: () => void;
}

const EditTaskDialog = ({ open, onOpenChange, task, onSubmit }: EditTaskDialogProps) => {
  const {
    formData,
    isUpdating,
    handleInputChange,
    handleTaskTypeChange,
    handleSave
  } = useTaskDialog(task, onSubmit, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        <TaskForm 
          formData={formData}
          onInputChange={handleInputChange}
          onTaskTypeChange={handleTaskTypeChange}
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

export default EditTaskDialog;
