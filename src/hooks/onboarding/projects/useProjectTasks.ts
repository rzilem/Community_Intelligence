
import { OnboardingProjectTask } from '@/types/onboarding-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProjectTasks = () => {
  const getProjectTasks = async (projectId: string): Promise<OnboardingProjectTask[]> => {
    try {
      const { data, error } = await supabase
        .from('onboarding_project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('stage_name', { ascending: true });
        
      if (error) {
        toast.error(`Error loading tasks: ${error.message}`);
        throw error;
      }
      
      const typedData = data?.map(task => ({
        ...task,
        status: (task.status || 'pending') as 'pending' | 'in_progress' | 'completed' | 'blocked',
        task_type: task.task_type as 'client' | 'team'
      })) || [];
      
      return typedData;
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      return [];
    }
  };
  
  const updateTaskStatus = async (taskId: string, status: OnboardingProjectTask['status']) => {
    const updates = {
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null
    };
    
    try {
      const { error } = await supabase
        .from('onboarding_project_tasks')
        .update(updates)
        .eq('id', taskId);
        
      if (error) {
        toast.error(`Error updating task: ${error.message}`);
        throw error;
      }
      
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  };

  return {
    getProjectTasks,
    updateTaskStatus
  };
};
