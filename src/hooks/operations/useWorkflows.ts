
import { useState } from 'react';
import { Workflow, WorkflowType, WorkflowStatus, WorkflowStep } from '@/types/workflow-types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSupabaseDelete } from '../supabase/use-supabase-delete';
import { actionStepMap } from '@/data/actionStepMap';

export const useWorkflows = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Mock workflow templates data
  const { 
    data: workflowTemplates = [],
    isLoading,
    error: fetchError,
    refetch
  } = useQuery({
    queryKey: ['workflowTemplates'],
    queryFn: async (): Promise<Workflow[]> => {
      // Mock workflow templates
      return [
        {
          id: '1',
          name: 'Compliance Review',
          description: 'Standard compliance review workflow',
          type: 'Compliance',
          status: 'template',
          steps: [
            {
              id: '1',
              name: 'Initial Review',
              description: 'Initial compliance review',
              order: 1,
              isComplete: false
            }
          ],
          isTemplate: true,
          isPopular: true,
          createdBy: null
        },
        {
          id: '2',
          name: 'Financial Audit',
          description: 'Financial audit workflow',
          type: 'Financial',
          status: 'template',
          steps: [
            {
              id: '1',
              name: 'Document Review',
              description: 'Review financial documents',
              order: 1,
              isComplete: false
            }
          ],
          isTemplate: true,
          isPopular: false,
          createdBy: null
        }
      ];
    }
  });

  // Mock active workflows data
  const { 
    data: activeWorkflows = [],
    isLoading: activeLoading,
    error: activeError,
    refetch: refetchActive
  } = useQuery({
    queryKey: ['activeWorkflows'],
    queryFn: async (): Promise<Workflow[]> => {
      // Mock active workflows
      return [
        {
          id: '3',
          name: 'Monthly Review Process',
          description: 'Active monthly review workflow',
          type: 'Financial',
          status: 'active',
          steps: [
            {
              id: '1',
              name: 'Data Collection',
              description: 'Collect monthly data',
              order: 1,
              isComplete: true
            },
            {
              id: '2',
              name: 'Analysis',
              description: 'Analyze collected data',
              order: 2,
              isComplete: false
            }
          ],
          isTemplate: false,
          isPopular: false,
          createdBy: 'user1'
        }
      ];
    }
  });

  // Use template mutation
  const useTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      setLoading(true);
      
      try {
        // Mock: Create a new workflow from template
        const template = workflowTemplates.find(t => t.id === templateId);
        if (!template) {
          throw new Error('Template not found');
        }
        
        const newWorkflow: Workflow = {
          id: Date.now().toString(),
          name: template.name,
          description: template.description,
          type: template.type,
          status: 'active',
          steps: template.steps,
          isTemplate: false,
          isPopular: false,
          createdBy: 'current-user'
        };
        
        return newWorkflow;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      toast.success('Workflow created from template');
      queryClient.invalidateQueries({ queryKey: ['activeWorkflows'] });
    },
    onError: (error) => {
      toast.error(`Error creating workflow: ${error.message}`);
    }
  });

  // Duplicate template mutation
  const duplicateTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      setLoading(true);
      
      try {
        // Mock: Duplicate template
        const template = workflowTemplates.find(t => t.id === templateId);
        if (!template) {
          throw new Error('Template not found');
        }
        
        const duplicatedTemplate: Workflow = {
          ...template,
          id: Date.now().toString(),
          name: `${template.name} (Copy)`,
          isPopular: false
        };
        
        return duplicatedTemplate;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      toast.success('Template duplicated successfully');
      queryClient.invalidateQueries({ queryKey: ['workflowTemplates'] });
    },
    onError: (error) => {
      toast.error(`Error duplicating template: ${error.message}`);
    }
  });

  // Create custom template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (workflowData: {
      name: string;
      description?: string;
      type: WorkflowType;
      steps?: WorkflowStep[];
    }) => {
      setLoading(true);
      
      try {
        // Initialize with a single default step if none provided
        const initialSteps = workflowData.steps && workflowData.steps.length > 0 ?
          workflowData.steps : [
          {
            id: crypto.randomUUID(),
            name: "First Step",
            description: "The first step in your workflow",
            order: 0,
            isComplete: false,
            notifyRoles: [],
            autoExecute: false
          }
        ];
            
        const newTemplate: Workflow = {
          id: Date.now().toString(),
          name: workflowData.name,
          description: workflowData.description || '',
          type: workflowData.type,
          status: 'template',
          steps: initialSteps,
          isTemplate: true,
          isPopular: false,
          createdBy: 'current-user'
        };
        
        return newTemplate;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (data) => {
      toast.success('Custom template created successfully');
      queryClient.invalidateQueries({ queryKey: ['workflowTemplates'] });
      navigate(`/operations/workflows/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Error creating template: ${error.message}`);
    }
  });

  // Pause workflow mutation
  const pauseWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      // Mock: Update workflow status
      console.log(`Mock: Pausing workflow ${workflowId}`);
      return { id: workflowId, status: 'inactive' };
    },
    onSuccess: () => {
      toast.success('Workflow paused');
      queryClient.invalidateQueries({ queryKey: ['activeWorkflows'] });
    },
    onError: (error) => {
      toast.error(`Error pausing workflow: ${error.message}`);
    }
  });

  // Resume workflow mutation
  const resumeWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      // Mock: Update workflow status
      console.log(`Mock: Resuming workflow ${workflowId}`);
      return { id: workflowId, status: 'active' };
    },
    onSuccess: () => {
      toast.success('Workflow resumed');
      queryClient.invalidateQueries({ queryKey: ['activeWorkflows'] });
    },
    onError: (error) => {
      toast.error(`Error resuming workflow: ${error.message}`);
    }
  });

  // Cancel workflow mutation
  const cancelWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      // Mock: Delete workflow
      console.log(`Mock: Cancelling workflow ${workflowId}`);
      return { id: workflowId };
    },
    onSuccess: () => {
      toast.success('Workflow cancelled');
      queryClient.invalidateQueries({ queryKey: ['activeWorkflows'] });
    },
    onError: (error) => {
      toast.error(`Error cancelling workflow: ${error.message}`);
    }
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      setIsDeleting(true);
      try {
        // Mock: Delete template
        console.log(`Mock: Deleting template ${templateId}`);
        return templateId;
      } finally {
        setIsDeleting(false);
      }
    },
    onSuccess: () => {
      toast.success('Template deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['workflowTemplates'] });
    },
    onError: (error) => {
      toast.error(`Error deleting template: ${error.message}`);
    }
  });

  // Handler functions
  const useWorkflowTemplate = (workflowId: string) => {
    useTemplateMutation.mutate(workflowId);
  };

  const duplicateTemplate = (workflowId: string) => {
    duplicateTemplateMutation.mutate(workflowId);
  };

  const createCustomTemplate = (workflowData: {
    name: string;
    description?: string;
    type: WorkflowType;
    steps?: WorkflowStep[];
  }) => {
    createTemplateMutation.mutate(workflowData);
  };

  const pauseWorkflow = (workflowId: string) => {
    pauseWorkflowMutation.mutate(workflowId);
  };

  const resumeWorkflow = (workflowId: string) => {
    resumeWorkflowMutation.mutate(workflowId);
  };

  const cancelWorkflow = (workflowId: string) => {
    cancelWorkflowMutation.mutate(workflowId);
  };

  const triggerWorkflowForStep = (actionStep: string) => {
    const templateId = actionStepMap[actionStep];
    if (templateId) {
      useTemplateMutation.mutate(templateId);
    } else {
      toast.info(`No workflow template mapped for step "${actionStep}"`);
    }
  };

  const deleteTemplate = (templateId: string) => {
    deleteTemplateMutation.mutate(templateId);
  };

  const viewWorkflowDetails = (workflowId: string) => {
    navigate(`/operations/workflows/${workflowId}`);
  };

  return {
    workflowTemplates,
    activeWorkflows,
    loading: isLoading || activeLoading || loading,
    error: fetchError || activeError || error,
    useWorkflowTemplate,
    duplicateTemplate,
    createCustomTemplate,
    pauseWorkflow,
    resumeWorkflow,
    cancelWorkflow,
    viewWorkflowDetails,
    triggerWorkflowForStep,
    deleteTemplate,
    isDeleting,
    refreshWorkflows: () => {
      refetch();
      refetchActive();
    },
    isCreating: createTemplateMutation.isPending
  };
};
