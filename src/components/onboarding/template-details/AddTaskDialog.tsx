
import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageName: string;
  formData: {
    name: string;
    description: string;
    estimated_days: number;
    assigned_role: string;
    task_type: 'client' | 'team';
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Task to {stageName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="task-name" className="text-sm font-medium">Task Name</label>
            <Input 
              id="task-name"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              placeholder="Enter task name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="task-description" className="text-sm font-medium">Description</label>
            <Textarea 
              id="task-description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              placeholder="Enter task description (optional)"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="task-days" className="text-sm font-medium">Estimated Days</label>
              <Input 
                id="task-days"
                name="estimated_days"
                type="number"
                value={formData.estimated_days.toString()}
                onChange={onInputChange}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="task-type" className="text-sm font-medium">Task Type</label>
              <select
                id="task-type"
                name="task_type"
                value={formData.task_type}
                onChange={onInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="team">Team</option>
                <option value="client">Client</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="assigned-role" className="text-sm font-medium">Assigned Role (Optional)</label>
            <Input 
              id="assigned-role"
              name="assigned_role"
              value={formData.assigned_role}
              onChange={onInputChange}
              placeholder="E.g., Manager, Accountant, Resident"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit}>Add Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;
