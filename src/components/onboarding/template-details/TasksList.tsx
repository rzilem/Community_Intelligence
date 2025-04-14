
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { OnboardingTask } from '@/types/onboarding-types';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import { toast } from 'sonner';
import EditTaskDialog from './EditTaskDialog';
import { Badge } from '@/components/ui/badge';

interface TasksListProps {
  tasks: OnboardingTask[];
  onTaskUpdated: () => void;
}

const TasksList = ({ tasks, onTaskUpdated }: TasksListProps) => {
  const [selectedTask, setSelectedTask] = useState<OnboardingTask | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { deleteTask } = useOnboardingTemplates();

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    
    try {
      await deleteTask(selectedTask.id);
      setDeleteDialogOpen(false);
      onTaskUpdated();
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No tasks found for this stage. Click the + button to add a task.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div 
          key={task.id} 
          className="bg-card border rounded-md p-3 flex justify-between items-center"
        >
          <div className="space-y-1">
            <div className="flex items-center">
              <h4 className="font-medium">{task.name}</h4>
              <Badge variant={task.task_type === 'client' ? 'outline' : 'secondary'} className="ml-2">
                {task.task_type === 'client' ? 'Client' : 'Team'}
              </Badge>
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}
            {task.assigned_role && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Assigned to:</span> {task.assigned_role}
              </p>
            )}
            {task.estimated_days > 0 && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Estimated:</span> {task.estimated_days} days
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setSelectedTask(task);
                setEditDialogOpen(true);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => {
                  setSelectedTask(task);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}

      {selectedTask && (
        <>
          <EditTaskDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            task={selectedTask}
            onSubmit={onTaskUpdated}
          />

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the "{selectedTask.name}" task? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleDeleteTask}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};

export default TasksList;
