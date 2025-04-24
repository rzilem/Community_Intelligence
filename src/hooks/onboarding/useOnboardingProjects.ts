
import { useProjectOperations } from './projects/useProjectOperations';
import { useProjectTasks } from './projects/useProjectTasks';
import { useProjectFromTemplate } from './projects/useProjectFromTemplate';
import { Lead } from '@/types/lead-types';
import { supabase } from '@/integrations/supabase/client';

export const useOnboardingProjects = () => {
  const projectOps = useProjectOperations();
  const projectTasks = useProjectTasks();
  const projectFromTemplate = useProjectFromTemplate();

  const getProjectLead = async (leadId: string): Promise<Lead | null> => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();
        
      if (error) {
        console.error(`Error loading lead: ${error.message}`);
        return null;
      }
      
      return data as Lead;
    } catch (error) {
      console.error('Error fetching project lead:', error);
      return null;
    }
  };

  return {
    // Project operations
    projects: projectOps.projects,
    isLoading: projectOps.isLoading,
    error: projectOps.error,
    createProject: projectOps.createProject,
    updateProject: projectOps.updateProject,
    isCreating: projectOps.isCreating,
    isUpdating: projectOps.isUpdating,
    refreshProjects: projectOps.refreshProjects,

    // Project tasks operations
    getProjectTasks: projectTasks.getProjectTasks,
    updateTaskStatus: projectTasks.updateTaskStatus,

    // Project from template
    createProjectFromTemplate: projectFromTemplate.createProjectFromTemplate,

    // Lead operations
    getProjectLead
  };
};
