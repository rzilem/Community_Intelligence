
import { useState } from 'react';
import { Workflow, WorkflowType } from '@/types/workflow-types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useWorkflows = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch workflow templates from Supabase
  const { 
    data: workflowTemplates = [],
    isLoading,
    error: fetchError,
    refetch
  } = useQuery({
    queryKey: ['workflowTemplates'],
    queryFn: async (): Promise<Workflow[]> => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('is_template', true);
        
      if (error) {
        throw new Error(error.message);
      }
      
      // Map the database results to our Workflow type
      return data.map((template: any) => ({
        id: template.id,
        name: template.name,
        description: template.description || '',
        type: template.type as WorkflowType,
        status: template.status,
        steps: template.steps || [],
        isTemplate: template.is_template,
        isPopular: template.is_popular || false
      }));
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
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('status', 'active');
        
      if (error) {
        throw new Error(error.message);
      }
      
      // Map the database results to our Workflow type
      return data.map((workflow: any) => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description || '',
        type: workflow.type as WorkflowType,
        status: workflow.status,
        steps: workflow.steps || [],
        isTemplate: workflow.is_template,
        isPopular: false
      }));
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
        const { data, error } = await supabase
          .from('workflows')
          .insert({
            name: template.name,
            description: template.description,
            type: template.type,
            status: 'active',
            steps: template.steps,
            is_template: false,
            created_by: (await supabase.auth.getUser()).data.user?.id
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

  const createTemplateMutation = useMutation({
    mutationFn: async (workflowData: Partial<Workflow>) => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .insert({
          name: workflowData.name || 'New Template',
          description: workflowData.description || '',
          type: workflowData.type || 'Governance',
          status: 'template',
          steps: workflowData.steps || [],
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

  const useWorkflowTemplate = (workflowId: string) => {
    useTemplateMutation.mutate(workflowId);
  };

  const createCustomTemplate = () => {
    // Open dialog to create custom template
    // For now, just create a simple template
    createTemplateMutation.mutate({
      name: 'Custom Workflow',
      description: 'A custom workflow template',
      type: 'Governance',
      steps: [
        {
          id: 'step-1',
          name: 'First Step',
          description: 'The first step in the custom workflow',
          order: 0
        }
      ]
    });
  };

  return {
    workflowTemplates,
    activeWorkflows,
    loading: isLoading || activeLoading || loading,
    error: fetchError || activeError || error,
    useWorkflowTemplate,
    createCustomTemplate,
    refreshWorkflows: () => {
      refetch();
      refetchActive();
    }
  };
};
