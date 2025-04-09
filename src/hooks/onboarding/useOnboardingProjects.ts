
import { useSupabaseQuery, useSupabaseCreate } from '@/hooks/supabase';
import { OnboardingProject, OnboardingProjectTask } from '@/types/onboarding-types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead-types';

export const useOnboardingProjects = () => {
  const { 
    data: projects = [],
    isLoading,
    error,
    refetch
  } = useSupabaseQuery<OnboardingProject[]>('onboarding_projects', {
    order: { column: 'created_at', ascending: false }
  });

  const createProject = useSupabaseCreate<OnboardingProject>('onboarding_projects', {
    onSuccess: () => {
      toast.success('Project created successfully');
      refetch();
    }
  });

  const getProjectTasks = async (projectId: string): Promise<OnboardingProjectTask[]> => {
    const { data, error } = await supabase
      .from('onboarding_project_tasks' as any)
      .select('*')
      .eq('project_id', projectId);
      
    if (error) {
      toast.error(`Error loading tasks: ${error.message}`);
      throw error;
    }
    
    // Use type assertion to safely convert the data
    return (data || []) as unknown as OnboardingProjectTask[];
  };
  
  const updateTaskStatus = async (taskId: string, status: OnboardingProjectTask['status']) => {
    const updates = {
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null
    };
    
    const { error } = await supabase
      .from('onboarding_project_tasks' as any)
      .update(updates)
      .eq('id', taskId);
      
    if (error) {
      toast.error(`Error updating task: ${error.message}`);
      throw error;
    }
    
    toast.success('Task updated successfully');
  };
  
  const getProjectLead = async (leadId: string): Promise<Lead | null> => {
    const { data, error } = await supabase
      .from('leads' as any)
      .select('*')
      .eq('id', leadId)
      .single();
      
    if (error) {
      console.error(`Error loading lead: ${error.message}`);
      return null;
    }
    
    // Use type assertion to safely convert the data
    return data as unknown as Lead;
  };

  return {
    projects,
    isLoading,
    error,
    createProject: createProject.mutateAsync,
    isCreating: createProject.isPending,
    getProjectTasks,
    updateTaskStatus,
    getProjectLead,
    refreshProjects: refetch
  };
};
