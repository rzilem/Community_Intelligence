
import { useState } from 'react';
import { Workflow, WorkflowType, WorkflowStatus } from '@/types/workflow-types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export const useWorkflows = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Fetch workflow templates from Supabase
  const { 
    data: workflowTemplates = [],
    isLoading,
    error: fetchError,
    refetch
  } = useQuery({
    queryKey: ['workflowTemplates'],
    queryFn: async (): Promise<Workflow[]> => {
      try {
        const { data, error } = await supabase
          .from('workflow_templates')
          .select('*')
          .eq('is_template', true);
          
        if (error) {
          throw new Error(error.message);
        }
        
        // Map the database results to our Workflow type
        return (data || []).map((template: any) => ({
          id: template.id,
          name: template.name || '',
          description: template.description || '',
          type: template.type as WorkflowType,
          status: template.status || 'template',
          steps: template.steps || [],
          isTemplate: template.is_template || true,
          isPopular: template.is_popular || false
        }));
      } catch (err) {
        console.error("Error fetching workflow templates:", err);
        throw err;
      }
    }
  });

  // Fetch active workflows from Supabase
  const { 
    data: activeWorkflows = [],
    isLoading: activeLoading,
    error: activeError,
    refetch: refetchActive
  } = useQuery({
    queryKey: ['activeWorkflows'],
    queryFn: async (): Promise<Workflow[]> => {
      try {
        const { data, error } = await supabase
          .from('workflows')
          .select('*')
          .eq('status', 'active');
          
        if (error) {
          throw new Error(error.message);
        }
        
        // Map the database results to our Workflow type
        return (data || []).map((workflow: any) => ({
          id: workflow.id,
          name: workflow.name || '',
          description: workflow.description || '',
          type: workflow.type as WorkflowType,
          status: workflow.status || 'active',
          steps: workflow.steps || [],
          isTemplate: workflow.is_template || false,
          isPopular: false
        }));
      } catch (err) {
        console.error("Error fetching active workflows:", err);
        throw err;
      }
    }
  });

  // Use template mutation
  const useTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      setLoading(true);
      
      try {
        // Get the template
        const { data: template, error: templateError } = await supabase
          .from('workflow_templates')
          .select('*')
          .eq('id', templateId)
          .single();
          
        if (templateError) throw new Error(templateError.message);
        
        // Create a new workflow from the template
        // Fixed RLS issue by ensuring all required fields are properly set
        // and specifically using auth.getUser() to set created_by
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        
        if (!userId) {
          throw new Error("User not authenticated");
        }
        
        const { data, error } = await supabase
          .from('workflows')
          .insert({
            name: template.name,
            description: template.description,
            type: template.type,
            status: 'active',
            steps: template.steps,
            is_template: false,
            created_by: userId
          })
          .select()
          .single();
          
        if (error) throw new Error(error.message);
        
        return data;
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
        // Get the original template
        const { data: template, error: templateError } = await supabase
          .from('workflow_templates')
          .select('*')
          .eq('id', templateId)
          .single();
          
        if (templateError) throw new Error(templateError.message);
        
        // Create a duplicate template
        const { data, error } = await supabase
          .from('workflow_templates')
          .insert({
            name: `${template.name} (Copy)`,
            description: template.description,
            type: template.type,
            status: template.status,
            steps: template.steps,
            is_template: true,
            is_popular: false
          })
          .select()
          .single();
          
        if (error) throw new Error(error.message);
        
        return data;
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
    mutationFn: async (workflowData: Partial<Workflow>) => {
      // Convert steps to a format compatible with JSON storage
      const stepsToInsert = workflowData.steps ? 
        JSON.parse(JSON.stringify(workflowData.steps)) : 
        [];
        
      const { data, error } = await supabase
        .from('workflow_templates')
        .insert({
          name: workflowData.name || 'New Template',
          description: workflowData.description || '',
          type: workflowData.type || 'Governance',
          status: 'template',
          steps: stepsToInsert,
          is_template: true,
          is_popular: false
        })
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast.success('Custom template created successfully');
      queryClient.invalidateQueries({ queryKey: ['workflowTemplates'] });
    },
    onError: (error) => {
      toast.error(`Error creating template: ${error.message}`);
    }
  });

  // Pause workflow mutation
  const pauseWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      const { data, error } = await supabase
        .from('workflows')
        .update({ status: 'inactive' })
        .eq('id', workflowId)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      return data;
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
      const { data, error } = await supabase
        .from('workflows')
        .update({ status: 'active' })
        .eq('id', workflowId)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      return data;
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
      const { data, error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast.success('Workflow cancelled');
      queryClient.invalidateQueries({ queryKey: ['activeWorkflows'] });
    },
    onError: (error) => {
      toast.error(`Error cancelling workflow: ${error.message}`);
    }
  });

  // Handler functions
  const useWorkflowTemplate = (workflowId: string) => {
    useTemplateMutation.mutate(workflowId);
  };

  const duplicateTemplate = (workflowId: string) => {
    duplicateTemplateMutation.mutate(workflowId);
  };

  const createCustomTemplate = () => {
    // For now, just create a simple template
    // In the future, this would open a dialog with a form
    createTemplateMutation.mutate({
      name: 'Custom Workflow',
      description: 'A custom workflow template',
      type: 'Governance',
      steps: [
        {
          id: 'step-1',
          name: 'First Step',
          description: 'The first step in the custom workflow',
          order: 0,
          isComplete: false
        }
      ]
    });
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
    refreshWorkflows: () => {
      refetch();
      refetchActive();
    }
  };
};
