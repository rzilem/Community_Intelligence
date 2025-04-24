
import { useSupabaseCreate, useSupabaseUpdate } from '@/hooks/supabase';
import { OnboardingProject } from '@/types/onboarding-types';
import { useSupabaseQuery } from '@/hooks/supabase';
import { toast } from 'sonner';

export const useProjectOperations = () => {
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
  
  const updateProject = useSupabaseUpdate<OnboardingProject>('onboarding_projects', {
    onSuccess: () => {
      toast.success('Project updated successfully');
      refetch();
    }
  });

  return {
    projects,
    isLoading,
    error,
    createProject: createProject.mutateAsync,
    updateProject: updateProject.mutateAsync,
    isCreating: createProject.isPending,
    isUpdating: updateProject.isPending,
    refreshProjects: refetch
  };
};
