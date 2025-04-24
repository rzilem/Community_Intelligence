
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import TaskForm from './task-dialog/TaskForm';

interface TaskFormData {
  name: string;
  description: string;
  estimated_days: number;
  assigned_role: string;
  task_type: 'client' | 'team';
}

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageName: string;
  formData: TaskFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: () => void;
}

const AddTaskDialog = ({ 
  open, 
  onOpenChange, 
  stageName,
  formData,
  onInputChange,
  onSubmit 
}: AddTaskDialogProps) => {
  const handleTaskTypeChange = (value: string) => {
    const event = {
      target: {
        name: 'task_type',
        value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(event);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Task to {stageName}</DialogTitle>
        </DialogHeader>
        
        <TaskForm 
          formData={formData}
          onInputChange={onInputChange}
          onTaskTypeChange={handleTaskTypeChange}
        />
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;
