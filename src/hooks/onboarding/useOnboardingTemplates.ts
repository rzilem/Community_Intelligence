
import { useState, useEffect } from 'react';
import { OnboardingTemplate, OnboardingStage, OnboardingTask } from '@/types/onboarding-types';
import { toast } from 'sonner';

export const useOnboardingTemplates = () => {
  const [templates, setTemplates] = useState<OnboardingTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mock templates data since onboarding tables don't exist
  useEffect(() => {
    const mockTemplates: OnboardingTemplate[] = [
      {
        id: '1',
        name: 'Standard Onboarding',
        description: 'Standard onboarding process for new HOA clients',
        template_type: 'hoa',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    setTemplates(mockTemplates);
  }, []);

  const refetch = async () => {
    console.log('Mock: Refetching templates');
  };

  // Create a new template
  const createTemplate = async (templateData: Partial<OnboardingTemplate>) => {
    setIsCreating(true);
    try {
      const newTemplate: OnboardingTemplate = {
        id: Date.now().toString(),
        name: templateData.name || 'New Template',
        description: templateData.description || '',
        template_type: templateData.template_type || 'hoa',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setTemplates(prev => [newTemplate, ...prev]);
      toast.success('Template created successfully');
      return newTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  // Update a template
  const updateTemplate = async (id: string, updates: Partial<OnboardingTemplate>) => {
    setIsUpdating(true);
    try {
      setTemplates(prev => prev.map(template => 
        template.id === id 
          ? { ...template, ...updates, updated_at: new Date().toISOString() }
          : template
      ));
      toast.success('Template updated successfully');
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete a template
  const deleteTemplate = async (id: string) => {
    setIsDeleting(true);
    try {
      setTemplates(prev => prev.filter(template => template.id !== id));
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  // Get template stages
  const getTemplateStages = async (templateId: string): Promise<OnboardingStage[]> => {
    try {
      // Mock stages data
      const mockStages: OnboardingStage[] = [
        {
          id: '1',
          template_id: templateId,
          name: 'Initial Setup',
          order_index: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          template_id: templateId,
          name: 'Documentation',
          order_index: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      return mockStages;
    } catch (error) {
      console.error('Error fetching template stages:', error);
      return [];
    }
  };
  
  // Get stage tasks
  const getStageTasks = async (stageId: string): Promise<OnboardingTask[]> => {
    try {
      // Mock tasks data
      const mockTasks: OnboardingTask[] = [
        {
          id: '1',
          stage_id: stageId,
          name: 'Setup Initial Account',
          order_index: 1,
          task_type: 'team',
          estimated_days: 1,
          description: 'Set up the initial account for the client',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          stage_id: stageId,
          name: 'Client Documentation Review',
          order_index: 2,
          task_type: 'client',
          estimated_days: 3,
          description: 'Review and process client documentation',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      return mockTasks;
    } catch (error) {
      console.error('Error fetching stage tasks:', error);
      return [];
    }
  };
  
  // Create a new stage
  const createStage = async (stage: Omit<OnboardingStage, 'id' | 'created_at' | 'updated_at'>): Promise<OnboardingStage> => {
    try {
      const newStage: OnboardingStage = {
        id: Date.now().toString(),
        ...stage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      toast.success('Stage created successfully');
      return newStage;
    } catch (error) {
      console.error('Error creating stage:', error);
      throw error;
    }
  };
  
  // Update a stage
  const updateStage = async ({ id, data }: { id: string; data: Partial<OnboardingStage> }): Promise<OnboardingStage> => {
    try {
      const updatedStage: OnboardingStage = {
        id,
        template_id: data.template_id || '',
        name: data.name || '',
        order_index: data.order_index || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...data
      };
      
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
      console.log(`Mock: Deleting stage ${id} and associated tasks`);
      toast.success('Stage deleted successfully');
    } catch (error) {
      console.error('Error deleting stage:', error);
      throw error;
    }
  };
  
  // Create a new task
  const createTask = async (task: Omit<OnboardingTask, 'id' | 'created_at' | 'updated_at'>): Promise<OnboardingTask> => {
    try {
      const newTask: OnboardingTask = {
        id: Date.now().toString(),
        ...task,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      toast.success('Task created successfully');
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };
  
  // Update a task
  const updateTask = async ({ id, data }: { id: string; data: Partial<OnboardingTask> }): Promise<OnboardingTask> => {
    try {
      const updatedTask: OnboardingTask = {
        id,
        stage_id: data.stage_id || '',
        name: data.name || '',
        order_index: data.order_index || 0,
        task_type: data.task_type || 'team',
        estimated_days: data.estimated_days || 1,
        description: data.description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...data
      };
      
      toast.success('Task updated successfully');
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };
  
  // Delete a task
  const deleteTask = async (id: string): Promise<void> => {
    try {
      console.log(`Mock: Deleting task ${id}`);
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
    createTemplate,
    updateTemplate,
    deleteTemplate,
    isCreating,
    isUpdating,
    isDeleting,
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
