
import { useSupabaseQuery, useSupabaseCreate, useSupabaseUpdate, useSupabaseDelete } from '@/hooks/supabase';
import { OnboardingTemplate, OnboardingStage, OnboardingTask } from '@/types/onboarding-types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useOnboardingTemplates = () => {
  const { 
    data: templates = [],
    isLoading,
    error,
    refetch
  } = useSupabaseQuery<OnboardingTemplate[]>('onboarding_templates', {
    order: { column: 'name', ascending: true }
  });

  // Create a new template
  const createTemplate = useSupabaseCreate<OnboardingTemplate>('onboarding_templates', {
    onSuccess: () => {
      toast.success('Template created successfully');
      refetch();
    },
    showSuccessToast: false,
    showErrorToast: true
  });

  // Update a template
  const updateTemplate = useSupabaseUpdate<OnboardingTemplate>('onboarding_templates', {
    onSuccess: () => {
      toast.success('Template updated successfully');
      refetch();
    },
    showSuccessToast: false,
    showErrorToast: true
  });

  // Delete a template
  const deleteTemplate = useSupabaseDelete('onboarding_templates', {
    onSuccess: () => {
      toast.success('Template deleted successfully');
      refetch();
    }
  });

  // Get template stages
  const getTemplateStages = async (templateId: string): Promise<OnboardingStage[]> => {
    try {
      const { data, error } = await supabase
        .from('onboarding_stages')
        .select('*')
        .eq('template_id', templateId)
        .order('order_index', { ascending: true });
        
      if (error) {
        toast.error(`Error loading stages: ${error.message}`);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching template stages:', error);
      return [];
    }
  };
  
  // Get stage tasks
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

      // Type cast to ensure task_type is of the correct type
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
  
  // Create a new stage
  const createStage = async (stage: Omit<OnboardingStage, 'id' | 'created_at' | 'updated_at'>): Promise<OnboardingStage> => {
    try {
      const { data, error } = await supabase
        .from('onboarding_stages')
        .insert([stage])
        .select()
        .single();
        
      if (error) {
        toast.error(`Error creating stage: ${error.message}`);
        throw error;
      }
      
      toast.success('Stage created successfully');
      return data;
    } catch (error) {
      console.error('Error creating stage:', error);
      throw error;
    }
  };
  
  // Update a stage
  const updateStage = async ({ id, data }: { id: string; data: Partial<OnboardingStage> }): Promise<OnboardingStage> => {
    try {
      const { data: updatedStage, error } = await supabase
        .from('onboarding_stages')
        .update(data)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        toast.error(`Error updating stage: ${error.message}`);
        throw error;
      }
      
      toast.success('Stage updated successfully');
      return updatedStage;
    } catch (error) {
      console.error('Error updating stage:', error);
      throw error;
    }
  };
  
  // Delete a stage
  const deleteStage = async (id: string): Promise<void> => {
    try {
      // First, delete all tasks associated with the stage
      const { error: tasksDeletionError } = await supabase
        .from('onboarding_tasks')
        .delete()
        .eq('stage_id', id);
      
      if (tasksDeletionError) {
        toast.error(`Error deleting stage tasks: ${tasksDeletionError.message}`);
        throw tasksDeletionError;
      }
      
      // Then delete the stage itself
      const { error } = await supabase
        .from('onboarding_stages')
        .delete()
        .eq('id', id);
        
      if (error) {
        toast.error(`Error deleting stage: ${error.message}`);
        throw error;
      }
      
      toast.success('Stage deleted successfully');
    } catch (error) {
      console.error('Error deleting stage:', error);
      throw error;
    }
  };
  
  // Create a new task
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
      
      // Type cast to ensure task_type is of the correct type
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
  
  // Update a task
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
      
      // Type cast to ensure task_type is of the correct type
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
  
  // Delete a task
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
    templates,
    isLoading,
    error,
    createTemplate: createTemplate.mutateAsync,
    updateTemplate: updateTemplate.mutateAsync,
    deleteTemplate: deleteTemplate.mutateAsync,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
    getTemplateStages,
    getStageTasks,
    createStage,
    updateStage,
    deleteStage,
    createTask,
    updateTask,
    deleteTask,
    refreshTemplates: refetch
  };
};
