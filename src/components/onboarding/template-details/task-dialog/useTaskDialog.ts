
import { useState, useEffect } from 'react';
import { OnboardingTask } from '@/types/onboarding-types';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import { toast } from 'sonner';

interface TaskFormData {
  name: string;
  description: string;
  estimated_days: number;
  assigned_role: string;
  task_type: 'client' | 'team';
}

export function useTaskDialog(task: OnboardingTask, onSubmit: () => void, onOpenChange: (open: boolean) => void) {
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    description: '',
    estimated_days: 0,
    assigned_role: '',
    task_type: 'team'
  });

  const { updateTask, isUpdating } = useOnboardingTemplates();

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        estimated_days: task.estimated_days || 0,
        assigned_role: task.assigned_role || '',
        task_type: task.task_type
      });
    }
  }, [task]);

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

  return {
    formData,
    isUpdating,
    handleInputChange,
    handleTaskTypeChange,
    handleSave
  };
}
