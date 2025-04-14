
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface AddTasksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageName: string;
  onSubmit: (tasks: { name: string; description?: string; estimated_days: number; assigned_role?: string; task_type: 'client' | 'team' }[]) => void;
}

const AddTasksDialog: React.FC<AddTasksDialogProps> = ({ 
  open, 
  onOpenChange, 
  stageName, 
  onSubmit 
}) => {
  const [tasks, setTasks] = useState<{ name: string; description?: string; estimated_days: number; assigned_role?: string; task_type: 'client' | 'team' }[]>([
    { name: '', description: '', estimated_days: 1, task_type: 'team' }
  ]);

  const handleAddTask = () => {
    setTasks([...tasks, { name: '', description: '', estimated_days: 1, task_type: 'team' }]);
  };

  const handleRemoveTask = (index: number) => {
    if (tasks.length > 1) {
      const newTasks = [...tasks];
      newTasks.splice(index, 1);
      setTasks(newTasks);
    }
  };

  const handleTaskChange = (index: number, field: string, value: string | number) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const handleSubmit = () => {
    const filledTasks = tasks.filter(task => task.name.trim() !== '');
    if (filledTasks.length === 0) {
      toast.error('Please add at least one task with a name');
      return;
    }
    onSubmit(filledTasks);
    setTasks([{ name: '', description: '', estimated_days: 1, task_type: 'team' }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Tasks to {stageName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {tasks.map((task, index) => (
            <div key={index} className="space-y-4 border-b pb-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Task {index + 1}</h4>
                {tasks.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveTask(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`task-name-${index}`}>Task Name*</Label>
                <Input 
                  id={`task-name-${index}`}
                  value={task.name}
                  onChange={(e) => handleTaskChange(index, 'name', e.target.value)}
                  placeholder="Enter task name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`task-description-${index}`}>Description (Optional)</Label>
                <Textarea 
                  id={`task-description-${index}`}
                  value={task.description}
                  onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                  placeholder="Enter task description"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`task-days-${index}`}>Estimated Days</Label>
                  <Input 
                    id={`task-days-${index}`}
                    type="number"
                    min="1"
                    value={task.estimated_days}
                    onChange={(e) => handleTaskChange(index, 'estimated_days', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label htmlFor={`task-type-${index}`}>Task Type</Label>
                  <Select 
                    value={task.task_type}
                    onValueChange={(value) => handleTaskChange(index, 'task_type', value as 'client' | 'team')}
                  >
                    <SelectTrigger id={`task-type-${index}`}>
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`task-role-${index}`}>Assigned Role (Optional)</Label>
                <Input 
                  id={`task-role-${index}`}
                  value={task.assigned_role || ''}
                  onChange={(e) => handleTaskChange(index, 'assigned_role', e.target.value)}
                  placeholder="e.g., Manager, Accountant"
                />
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={handleAddTask} className="w-full">
            Add Another Task
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Tasks</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTasksDialog;
