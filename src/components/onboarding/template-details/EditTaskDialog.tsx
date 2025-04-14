
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingTask } from '@/types/onboarding-types';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import { toast } from 'sonner';

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: OnboardingTask;
  onSubmit: () => void;
}

const EditTaskDialog = ({ open, onOpenChange, task, onSubmit }: EditTaskDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    estimated_days: 0,
    assigned_role: '',
    task_type: 'team' as 'client' | 'team'
  });

  const { updateTask, isUpdating } = useOnboardingTemplates();

  useEffect(() => {
    if (open && task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        estimated_days: task.estimated_days || 0,
        assigned_role: task.assigned_role || '',
        task_type: task.task_type
      });
    }
  }, [open, task]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'estimated_days' ? parseInt(value) || 0 : value 
    }));
  };

  const handleTaskTypeChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      task_type: value as 'client' | 'team' 
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Task name is required');
      return;
    }

    try {
      await updateTask({
        id: task.id,
        data: {
          name: formData.name,
          description: formData.description || undefined,
          estimated_days: formData.estimated_days,
          assigned_role: formData.assigned_role || undefined,
          task_type: formData.task_type
        }
      });
      
      onOpenChange(false);
      onSubmit();
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-task-name">Task Name</Label>
            <Input
              id="edit-task-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter task name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-task-description">Description</Label>
            <Textarea
              id="edit-task-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-task-days">Estimated Days</Label>
              <Input
                id="edit-task-days"
                name="estimated_days"
                type="number"
                min="0"
                value={formData.estimated_days}
                onChange={handleInputChange}
                placeholder="Enter estimated days"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-task-type">Task Type</Label>
              <Select
                value={formData.task_type}
                onValueChange={handleTaskTypeChange}
              >
                <SelectTrigger id="edit-task-type">
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-task-role">Assigned Role</Label>
            <Input
              id="edit-task-role"
              name="assigned_role"
              value={formData.assigned_role}
              onChange={handleInputChange}
              placeholder="Enter assigned role (optional)"
            />
          </div>
        </div>
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
