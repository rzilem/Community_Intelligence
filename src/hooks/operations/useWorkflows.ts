
import { useState } from 'react';
import { useSupabaseQuery, useSupabaseCreate, useSupabaseUpdate, useSupabaseDelete } from '@/hooks/supabase';
import { Workflow, WorkflowStep, WorkflowStatus, WorkflowType } from '@/types/workflow-types';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function useWorkflows(templateOnly: boolean = false) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Query to fetch workflows
  const { data: workflows = [], isLoading: isLoadingWorkflows, error, refetch } = useSupabaseQuery<Workflow[]>(
    'workflows',
    {
      select: '*',
      filter: templateOnly 
        ? [{ column: 'is_template', value: true }] 
        : [{ column: 'is_template', value: false }],
      order: { column: 'created_at', ascending: false }
    }
  );

  // Query to fetch workflow templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useSupabaseQuery<Workflow[]>(
    'workflows',
    {
      select: '*',
      filter: [{ column: 'is_template', value: true }],
      order: { column: 'created_at', ascending: false }
    },
    !templateOnly // Only fetch if not already fetching templates
  );

  // Mutations for CRUD operations
  const { mutate: createWorkflow } = useSupabaseCreate('workflows');
  const { mutate: updateWorkflow } = useSupabaseUpdate('workflows');
  const { mutate: deleteWorkflow } = useSupabaseDelete('workflows');

  // Hook to get a single workflow by ID
  const useWorkflow = (id?: string) => {
    const { id: paramId } = useParams();
    const workflowId = id || paramId;

    const { data: workflow, isLoading, error } = useSupabaseQuery<Workflow>(
      ['workflows', workflowId],
      {
        select: '*',
        filter: [{ column: 'id', value: workflowId }],
        single: true
      },
      !!workflowId
    );

    return {
      workflow,
      isLoading,
      error
    };
  };

  // Save workflow function
  const saveWorkflow = async (workflow: Partial<Workflow>): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (workflow.id) {
        await updateWorkflow({ 
          id: workflow.id, 
          data: workflow 
        });
        toast.success('Workflow updated successfully');
      } else {
        await createWorkflow(workflow);
        toast.success('Workflow created successfully');
      }
      refetch();
      return true;
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove workflow function
  const removeWorkflow = async (id: string): Promise<boolean> => {
    try {
      await deleteWorkflow(id);
      toast.success('Workflow deleted successfully');
      refetch();
      return true;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete workflow');
      return false;
    }
  };

  // Function to create a workflow from a template
  const createFromTemplate = async (templateId: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      // Find the template
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Create a new workflow based on the template
      const newWorkflow: Partial<Workflow> = {
        name: template.name,
        description: template.description,
        type: template.type,
        status: 'active' as WorkflowStatus,
        steps: template.steps,
        is_template: false,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      };

      const { data, error } = await supabase
        .from('workflows')
        .insert(newWorkflow)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Workflow created from template');
      refetch();
      return data.id;
    } catch (error) {
      console.error('Error creating workflow from template:', error);
      toast.error('Failed to create workflow from template');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to duplicate a workflow
  const duplicateWorkflow = async (id: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const workflow = workflows.find(w => w.id === id) || 
                      templates.find(t => t.id === id);
      
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Create a duplicate with a slightly different name
      const newWorkflow: Partial<Workflow> = {
        name: `${workflow.name} (Copy)`,
        description: workflow.description,
        type: workflow.type,
        status: workflow.is_template ? 'template' : 'draft' as WorkflowStatus,
        steps: workflow.steps,
        is_template: workflow.is_template,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      };

      const { data, error } = await supabase
        .from('workflows')
        .insert(newWorkflow)
        .select()
        .single();

      if (error) throw error;

      toast.success('Workflow duplicated successfully');
      refetch();
      return data.id;
    } catch (error) {
      console.error('Error duplicating workflow:', error);
      toast.error('Failed to duplicate workflow');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update workflow status
  const updateWorkflowStatus = async (id: string, status: WorkflowStatus): Promise<boolean> => {
    try {
      await updateWorkflow({
        id,
        data: { status }
      });
      
      toast.success(`Workflow ${status === 'inactive' ? 'paused' : status}`);
      refetch();
      return true;
    } catch (error) {
      console.error('Error updating workflow status:', error);
      toast.error('Failed to update workflow status');
      return false;
    }
  };

  // Function to complete a workflow step
  const completeWorkflowStep = async (workflowId: string, stepId: string): Promise<boolean> => {
    try {
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      const updatedSteps = workflow.steps.map(step => {
        if (step.id === stepId) {
          return { ...step, isComplete: true };
        }
        return step;
      });

      await updateWorkflow({
        id: workflowId,
        data: { steps: updatedSteps }
      });

      // Check if all steps are complete
      const allComplete = updatedSteps.every(step => step.isComplete);
      if (allComplete) {
        await updateWorkflowStatus(workflowId, 'completed');
      }

      refetch();
      return true;
    } catch (error) {
      console.error('Error completing workflow step:', error);
      toast.error('Failed to complete workflow step');
      return false;
    }
  };

  return {
    workflows,
    templates,
    isLoading: isLoadingWorkflows || isLoadingTemplates || isLoading,
    error,
    saveWorkflow,
    removeWorkflow,
    createFromTemplate,
    duplicateWorkflow,
    updateWorkflowStatus,
    completeWorkflowStep,
    searchTerm,
    setSearchTerm,
    refetch,
    useWorkflow
  };
}
