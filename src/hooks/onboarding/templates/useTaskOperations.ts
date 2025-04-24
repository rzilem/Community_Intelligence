
import { toast } from 'sonner';
import { OnboardingTask } from '@/types/onboarding-types';
import { supabase } from '@/integrations/supabase/client';

export const useTaskOperations = () => {
  const getStageTasks = async (stageId: string): Promise<OnboardingTask[]> => {
    try {
      const { data, error } = await supabase
        .from('onboarding_tasks')
        .select('*')
        .eq('stage_id', stageId)
        .order('order_index', { ascending: true });
        
      if (error) {
        toast.error(`Error loading tasks: ${error.message}`);
        throw error;
      }

      const typedData = data?.map(task => ({
        ...task,
        task_type: (task.task_type || 'team') as 'client' | 'team'
      })) || [];
      
      return typedData;
    } catch (error) {
      console.error('Error fetching stage tasks:', error);
      return [];
    }
  };
  
  const createTask = async (task: Omit<OnboardingTask, 'id' | 'created_at' | 'updated_at'>): Promise<OnboardingTask> => {
    try {
      const { data, error } = await supabase
        .from('onboarding_tasks')
        .insert([task])
        .select()
        .single();
        
      if (error) {
        toast.error(`Error creating task: ${error.message}`);
        throw error;
      }
      
      const typedData = {
        ...data,
        task_type: data.task_type as 'client' | 'team'
      };
      
      toast.success('Task created successfully');
      return typedData;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };
  
  const updateTask = async ({ id, data }: { id: string; data: Partial<OnboardingTask> }): Promise<OnboardingTask> => {
    try {
      const { data: updatedTask, error } = await supabase
        .from('onboarding_tasks')
        .update(data)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        toast.error(`Error updating task: ${error.message}`);
        throw error;
      }
      
      const typedData = {
        ...updatedTask,
        task_type: updatedTask.task_type as 'client' | 'team'
      };
      
      toast.success('Task updated successfully');
      return typedData;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };
  
  const deleteTask = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('onboarding_tasks')
        .delete()
        .eq('id', id);
        
      if (error) {
        toast.error(`Error deleting task: ${error.message}`);
        throw error;
      }
      
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  return {
    getStageTasks,
    createTask,
    updateTask,
    deleteTask
  };
};
