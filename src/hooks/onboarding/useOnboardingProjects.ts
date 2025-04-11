
import { useSupabaseQuery, useSupabaseCreate, useSupabaseUpdate } from '@/hooks/supabase';
import { OnboardingProject, OnboardingProjectTask, OnboardingTemplate, OnboardingTask, OnboardingStage } from '@/types/onboarding-types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead-types';
import { useOnboardingTemplates } from './useOnboardingTemplates';
import { format, addDays } from 'date-fns';

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
  
  const updateProject = useSupabaseUpdate<OnboardingProject>('onboarding_projects', {
    onSuccess: () => {
      toast.success('Project updated successfully');
      refetch();
    }
  });

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
      
      // Type cast to ensure status is of the correct type
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

  const getProjectTemplate = async (templateId: string): Promise<OnboardingTemplate | null> => {
    try {
      const { data, error } = await supabase
        .from('onboarding_templates')
        .select('*')
        .eq('id', templateId)
        .single();
        
      if (error) {
        console.error(`Error loading template: ${error.message}`);
        return null;
      }
      
      return data as OnboardingTemplate;
    } catch (error) {
      console.error('Error fetching project template:', error);
      return null;
    }
  };

  const createProjectFromTemplate = async (
    projectData: {
      name: string;
      lead_id: string;
      template_id: string;
      start_date: string;
    }
  ) => {
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
          // Calculate due date based on task estimated days
          const daysToAdd = task.estimated_days || 1;
          const dueDate = format(addDays(startDate, dayOffset + daysToAdd), 'yyyy-MM-dd');
          dayOffset += daysToAdd;
          
          // Make sure to handle the task_type type safely
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
      refetch();
      
      return createdProject;
    } catch (error) {
      console.error('Error in createProjectFromTemplate:', error);
      throw error;
    }
  };

  return {
    projects,
    isLoading,
    error,
    createProject: createProject.mutateAsync,
    updateProject: updateProject.mutateAsync,
    isCreating: createProject.isPending,
    isUpdating: updateProject.isPending,
    getProjectTasks,
    updateTaskStatus,
    getProjectLead,
    getProjectTemplate,
    createProjectFromTemplate,
    refreshProjects: refetch
  };
};
