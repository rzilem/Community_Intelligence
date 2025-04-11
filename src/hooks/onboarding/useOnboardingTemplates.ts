
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

  const createTemplate = useSupabaseCreate<OnboardingTemplate>('onboarding_templates', {
    onSuccess: () => {
      toast.success('Template created successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create template: ${error.message}`);
    }
  });

  const updateTemplate = useSupabaseUpdate<OnboardingTemplate>('onboarding_templates', {
    onSuccess: () => {
      toast.success('Template updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update template: ${error.message}`);
    }
  });

  const deleteTemplate = useSupabaseDelete<OnboardingTemplate>('onboarding_templates', {
    onSuccess: () => {
      toast.success('Template deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    }
  });

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

  const getTasksForStage = async (stageId: string): Promise<OnboardingTask[]> => {
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
      
      return data || [];
    } catch (error) {
      console.error('Error fetching stage tasks:', error);
      return [];
    }
  };

  const createStage = async (stage: Omit<OnboardingStage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('onboarding_stages')
        .insert(stage)
        .select();
        
      if (error) {
        toast.error(`Error creating stage: ${error.message}`);
        throw error;
      }
      
      toast.success('Stage created successfully');
      return data?.[0];
    } catch (error) {
      console.error('Error creating stage:', error);
      throw error;
    }
  };

  const createTask = async (task: Omit<OnboardingTask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('onboarding_tasks')
        .insert(task)
        .select();
        
      if (error) {
        toast.error(`Error creating task: ${error.message}`);
        throw error;
      }
      
      toast.success('Task created successfully');
      return data?.[0];
    } catch (error) {
      console.error('Error creating task:', error);
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
    getTasksForStage,
    createStage,
    createTask,
    refreshTemplates: refetch
  };
};
