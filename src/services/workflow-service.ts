
import { supabase } from '@/integrations/supabase/client';
import { Workflow, WorkflowStep } from '@/types/workflow-types';

export interface WorkflowExecution {
  id: string;
  workflow_template_id: string;
  association_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  execution_data: Record<string, any>;
  performance_metrics: Record<string, any>;
  ai_insights: Record<string, any>;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const workflowService = {
  // Get all workflow templates
  getWorkflowTemplates: async (): Promise<Workflow[]> => {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('is_template', true)
      .order('is_popular', { ascending: false })
      .order('name');

    if (error) throw error;
    
    return data?.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      type: row.type as any,
      status: row.status as any,
      steps: Array.isArray(row.steps) ? row.steps : [],
      isTemplate: row.is_template,
      isPopular: row.is_popular,
      createdBy: row.created_by
    })) || [];
  },

  // Get workflow templates by type
  getWorkflowTemplatesByType: async (type: string): Promise<Workflow[]> => {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('is_template', true)
      .eq('type', type)
      .order('is_popular', { ascending: false })
      .order('name');

    if (error) throw error;
    
    return data?.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      type: row.type as any,
      status: row.status as any,
      steps: Array.isArray(row.steps) ? row.steps : [],
      isTemplate: row.is_template,
      isPopular: row.is_popular,
      createdBy: row.created_by
    })) || [];
  },

  // Create custom workflow
  createWorkflow: async (workflow: Omit<Workflow, 'id'>): Promise<Workflow> => {
    const { data, error } = await supabase
      .from('workflows')
      .insert({
        name: workflow.name,
        description: workflow.description,
        type: workflow.type,
        steps: workflow.steps,
        status: workflow.status,
        is_template: workflow.isTemplate,
        is_popular: false,
        created_by: null // Will be set by RLS
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      type: data.type,
      status: data.status,
      steps: data.steps || [],
      isTemplate: data.is_template,
      isPopular: data.is_popular,
      createdBy: data.created_by
    };
  },

  // Execute workflow for association
  executeWorkflow: async (workflowId: string, associationId: string): Promise<WorkflowExecution> => {
    const { data, error } = await supabase
      .from('workflow_executions')
      .insert({
        workflow_template_id: workflowId,
        association_id: associationId,
        status: 'pending',
        execution_data: {},
        performance_metrics: {},
        ai_insights: {},
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get executions for association
  getWorkflowExecutions: async (associationId: string): Promise<WorkflowExecution[]> => {
    const { data, error } = await supabase
      .from('workflow_executions')
      .select(`
        *,
        workflow:workflows(name, type, description)
      `)
      .eq('association_id', associationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // AI-powered workflow generation
  generateWorkflowSteps: async (name: string, type: string, description?: string) => {
    const { data, error } = await supabase.functions.invoke('workflow-ai', {
      body: {
        action: 'generate',
        workflowName: name,
        workflowType: type,
        description
      }
    });

    if (error) throw error;
    return data.result;
  },

  // AI-powered workflow optimization
  optimizeWorkflowSteps: async (existingSteps: WorkflowStep[]) => {
    const { data, error } = await supabase.functions.invoke('workflow-ai', {
      body: {
        action: 'optimize',
        existingSteps
      }
    });

    if (error) throw error;
    return data.result;
  }
};
