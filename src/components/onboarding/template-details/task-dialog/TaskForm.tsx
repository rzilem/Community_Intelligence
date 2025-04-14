
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskFormData {
  name: string;
  description: string;
  estimated_days: number;
  assigned_role: string;
  task_type: 'client' | 'team';
}

interface TaskFormProps {
  formData: TaskFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onTaskTypeChange: (value: string) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  formData, 
  onInputChange, 
  onTaskTypeChange 
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="edit-task-name">Task Name</Label>
        <Input
          id="edit-task-name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Enter task name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-task-description">Description</Label>
        <Textarea
          id="edit-task-description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
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
            onChange={onInputChange}
            placeholder="Enter estimated days"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-task-type">Task Type</Label>
          <Select
            value={formData.task_type}
            onValueChange={onTaskTypeChange}
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
          onChange={onInputChange}
          placeholder="Enter assigned role (optional)"
        />
      </div>
    </div>
  );
};

export default TaskForm;
