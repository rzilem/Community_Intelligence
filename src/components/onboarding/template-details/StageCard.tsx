
import React, { useState } from 'react';
import { 
  Card, CardHeader, CardContent, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  GripVertical, Calendar, Plus, MoreHorizontal, Edit, Trash2
} from 'lucide-react';
import { OnboardingStage, OnboardingTask } from '@/types/onboarding-types';
import TasksList from './TasksList';
import AddTaskDialog from './AddTaskDialog';
import EditStageDialog from './EditStageDialog';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface StageCardProps {
  stage: OnboardingStage;
  tasks: OnboardingTask[];
  onStageUpdated: () => void;
  onStageDeleted: () => void;
}

const StageCard = ({ stage, tasks, onStageUpdated, onStageDeleted }: StageCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    name: '',
    description: '',
    estimated_days: 1,
    assigned_role: '',
    task_type: 'team' as 'client' | 'team'
  });

  const { createTask, updateStage, deleteStage } = useOnboardingTemplates();

  const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({ 
      ...prev, 
      [name]: name === 'estimated_days' ? parseInt(value) || 0 : value 
    }));
  };

  const handleAddTask = async () => {
    if (!taskFormData.name) {
      toast.error('Task name is required');
      return;
    }
    
    try {
      await createTask({
        stage_id: stage.id,
        name: taskFormData.name,
        description: taskFormData.description,
        order_index: tasks.length || 0,
        estimated_days: taskFormData.estimated_days,
        assigned_role: taskFormData.assigned_role,
        task_type: taskFormData.task_type
      });
      
      setTaskFormData({
        name: '',
        description: '',
        estimated_days: 1,
        assigned_role: '',
        task_type: 'team'
      });
      setTaskDialogOpen(false);
      onStageUpdated();
      toast.success('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const handleDeleteStage = async () => {
    try {
      await deleteStage(stage.id);
      setDeleteDialogOpen(false);
      onStageDeleted();
      toast.success('Stage deleted successfully');
    } catch (error) {
      console.error('Error deleting stage:', error);
      toast.error('Failed to delete stage');
    }
  };

  return (
    <Card>
      <CardHeader className="cursor-pointer relative" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <GripVertical className="h-5 w-5 text-muted-foreground mr-2" />
            <CardTitle className="text-lg">{stage.name}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{stage.estimated_days || 0} days</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {tasks.length} tasks
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setStageDialogOpen(true);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Stage
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Stage
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setTaskDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <TasksList tasks={tasks} onTaskUpdated={onStageUpdated} />
        </CardContent>
      )}

      <AddTaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        stageName={stage.name}
        formData={taskFormData}
        onInputChange={handleTaskInputChange}
        onSubmit={handleAddTask}
      />

      <EditStageDialog
        open={stageDialogOpen}
        onOpenChange={setStageDialogOpen}
        stage={stage}
        onSubmit={onStageUpdated}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stage</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{stage.name}" stage? This action will also delete all tasks associated with this stage and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleDeleteStage}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default StageCard;
