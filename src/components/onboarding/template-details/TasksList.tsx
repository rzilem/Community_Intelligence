
import React from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  GripVertical, Edit, Trash 
} from 'lucide-react';
import { OnboardingTask } from '@/types/onboarding-types';

interface TasksListProps {
  tasks: OnboardingTask[];
}

const TasksList = ({ tasks }: TasksListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No tasks in this stage yet. Add your first task.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]"></TableHead>
          <TableHead>Task</TableHead>
          <TableHead className="w-[120px]">Type</TableHead>
          <TableHead className="w-[100px]">Days</TableHead>
          <TableHead className="w-[100px]">Role</TableHead>
          <TableHead className="w-[100px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell>
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </TableCell>
            <TableCell>
              <div className="font-medium">{task.name}</div>
              {task.description && (
                <div className="text-xs text-muted-foreground mt-1">{task.description}</div>
              )}
            </TableCell>
            <TableCell>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                task.task_type === 'client' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {task.task_type}
              </span>
            </TableCell>
            <TableCell>{task.estimated_days || 1}</TableCell>
            <TableCell>{task.assigned_role || '-'}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TasksList;
