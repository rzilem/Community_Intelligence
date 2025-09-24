
import { useState, useEffect } from 'react';
import { OnboardingProject, OnboardingProjectTask, OnboardingTemplate, OnboardingTask, OnboardingStage } from '@/types/onboarding-types';
import { toast } from 'sonner';
import { Lead } from '@/types/lead-types';
import { addDays, format } from 'date-fns';

export const useOnboardingProjects = () => {
  const [projects, setProjects] = useState<OnboardingProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Mock projects data since onboarding tables don't exist
  useEffect(() => {
    const mockProjects: OnboardingProject[] = [
      {
        id: '1',
        name: 'Sample Onboarding Project',
        lead_id: 'lead-1',
        template_id: 'template-1',
        start_date: new Date().toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    setProjects(mockProjects);
  }, []);

  const refetch = async () => {
    console.log('Mock: Refetching projects');
  };

  const createProject = async (projectData: Partial<OnboardingProject>) => {
    setIsCreating(true);
    try {
      const newProject: OnboardingProject = {
        id: Date.now().toString(),
        name: projectData.name || 'New Project',
        lead_id: projectData.lead_id || '',
        template_id: projectData.template_id || '',
        start_date: projectData.start_date || new Date().toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setProjects(prev => [newProject, ...prev]);
      toast.success('Project created successfully');
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };
  
  const updateProject = async (id: string, updates: Partial<OnboardingProject>) => {
    setIsUpdating(true);
    try {
      setProjects(prev => prev.map(project => 
        project.id === id 
          ? { ...project, ...updates, updated_at: new Date().toISOString() }
          : project
      ));
      toast.success('Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const getProjectTasks = async (projectId: string): Promise<OnboardingProjectTask[]> => {
    try {
      // Mock project tasks data
      const mockTasks: OnboardingProjectTask[] = [
        {
          id: '1',
          project_id: projectId,
          template_task_id: 'template-task-1',
          task_name: 'Initial Setup',
          stage_name: 'Setup',
          status: 'pending',
          due_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
          task_type: 'team',
          assigned_to: null,
          notes: 'Initial project setup tasks',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          project_id: projectId,
          template_task_id: 'template-task-2',
          task_name: 'Client Documentation',
          stage_name: 'Documentation',
          status: 'in_progress',
          due_date: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
          task_type: 'client',
          assigned_to: null,
          notes: 'Gather client documentation',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      return mockTasks;
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      return [];
    }
  };
  
  const updateTaskStatus = async (taskId: string, status: OnboardingProjectTask['status']) => {
    try {
      console.log(`Mock: Updating task ${taskId} status to ${status}`);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  };
  
  const getProjectLead = async (leadId: string): Promise<Lead | null> => {
    try {
      // Mock lead data
      const mockLead: Lead = {
        id: leadId,
        name: 'Sample Lead',
        email: 'lead@example.com',
        phone: '555-0123',
        source: 'website',
        status: 'new',
        association_name: 'Sample HOA',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return mockLead;
    } catch (error) {
      console.error('Error fetching project lead:', error);
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
      // Mock project creation from template
      const newProject: OnboardingProject = {
        id: Date.now().toString(),
        name: projectData.name,
        lead_id: projectData.lead_id,
        template_id: projectData.template_id,
        start_date: projectData.start_date,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setProjects(prev => [newProject, ...prev]);
      toast.success('Project created with all tasks');
      
      return newProject;
    } catch (error) {
      console.error('Error in createProjectFromTemplate:', error);
      throw error;
    }
  };

  return {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    isCreating,
    isUpdating,
    getProjectTasks,
    updateTaskStatus,
    getProjectLead,
    createProjectFromTemplate,
    refreshProjects: refetch
  };
};
