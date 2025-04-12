
import React, { useState } from 'react';
import { 
  Card, CardHeader, CardContent, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  GripVertical, Calendar, Plus 
} from 'lucide-react';
import { OnboardingStage, OnboardingTask } from '@/types/onboarding-types';
import TasksList from './TasksList';
import AddTaskDialog from './AddTaskDialog';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import { toast } from 'sonner';

interface StageCardProps {
  stage: OnboardingStage;
  tasks: OnboardingTask[];
}

const StageCard = ({ stage, tasks }: StageCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    name: '',
    description: '',
    estimated_days: 1,
    assigned_role: '',
    task_type: 'team' as 'client' | 'team'
  });

  const { createTask } = useOnboardingTemplates();

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
      toast.success('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
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
          <TasksList tasks={tasks} />
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
    </Card>
  );
};

export default StageCard;
