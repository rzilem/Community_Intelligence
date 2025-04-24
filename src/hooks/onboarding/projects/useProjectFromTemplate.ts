
import { addDays, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProjectData {
  name: string;
  lead_id: string;
  template_id: string;
  start_date: string;
}

export const useProjectFromTemplate = () => {
  const createProjectFromTemplate = async (projectData: ProjectData) => {
    try {
      // Create the project
      const { data: newProject, error: projectError } = await supabase
        .from('onboarding_projects')
        .insert({
          name: projectData.name,
          lead_id: projectData.lead_id,
          template_id: projectData.template_id,
          start_date: projectData.start_date,
          status: 'active'
        })
        .select();
        
      if (projectError) {
        toast.error(`Error creating project: ${projectError.message}`);
        throw projectError;
      }
      
      if (!newProject || newProject.length === 0) {
        throw new Error('Failed to create project - no data returned');
      }
      
      const createdProject = newProject[0];
      
      // Get template stages and tasks
      const { data: templateStages, error: stagesError } = await supabase
        .from('onboarding_stages')
        .select('*')
        .eq('template_id', projectData.template_id)
        .order('order_index', { ascending: true });
        
      if (stagesError) {
        toast.error(`Error getting template stages: ${stagesError.message}`);
        throw stagesError;
      }
      
      // For each stage, get tasks and create project tasks
      let dayOffset = 0;
      const startDate = new Date(projectData.start_date);
      const projectTasks = [];
      
      for (const stage of templateStages || []) {
        const { data: tasks, error: tasksError } = await supabase
          .from('onboarding_tasks')
          .select('*')
          .eq('stage_id', stage.id)
          .order('order_index', { ascending: true });
          
        if (tasksError) {
          toast.error(`Error getting tasks for stage: ${tasksError.message}`);
          continue;
        }
        
        for (const task of tasks || []) {
          const daysToAdd = task.estimated_days || 1;
          const dueDate = format(addDays(startDate, dayOffset + daysToAdd), 'yyyy-MM-dd');
          dayOffset += daysToAdd;
          
          const taskType = task.task_type === 'client' ? 'client' : 'team';
          
          projectTasks.push({
            project_id: createdProject.id,
            template_task_id: task.id,
            task_name: task.name,
            stage_name: stage.name,
            status: 'pending',
            due_date: dueDate,
            task_type: taskType,
            assigned_to: null,
            notes: task.description || null
          });
        }
      }
      
      // Insert all project tasks
      if (projectTasks.length > 0) {
        const { error: insertTasksError } = await supabase
          .from('onboarding_project_tasks')
          .insert(projectTasks);
          
        if (insertTasksError) {
          toast.error(`Error creating project tasks: ${insertTasksError.message}`);
          throw insertTasksError;
        }
      }
      
      toast.success('Project created with all tasks');
      return createdProject;
    } catch (error) {
      console.error('Error in createProjectFromTemplate:', error);
      throw error;
    }
  };

  return {
    createProjectFromTemplate
  };
};
