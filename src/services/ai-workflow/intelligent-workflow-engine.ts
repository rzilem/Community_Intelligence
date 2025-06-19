
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';
import { WorkflowTemplate, WorkflowExecution } from '@/types/ai-workflow-types';

// Helper function to convert workflows table data to WorkflowTemplate format
function convertToWorkflowTemplate(row: any): WorkflowTemplate {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    category: row.type, // Map 'type' to 'category'
    workflow_type: row.type,
    template_data: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps || {},
    ai_optimization_score: 0, // Default value since workflows table doesn't have this
    usage_count: 0, // Default value
    is_ai_recommended: row.is_popular || false,
    created_by: row.created_by,
    association_id: null, // Templates don't have association_id
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// Helper function to convert workflow_executions data
function convertToWorkflowExecution(row: any): WorkflowExecution {
  return {
    id: row.id,
    workflow_template_id: row.workflow_template_id,
    association_id: row.association_id,
    status: row.status as 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
    execution_data: typeof row.execution_data === 'string' ? JSON.parse(row.execution_data) : row.execution_data || {},
    performance_metrics: typeof row.performance_metrics === 'string' ? JSON.parse(row.performance_metrics) : row.performance_metrics || {},
    ai_insights: typeof row.ai_insights === 'string' ? JSON.parse(row.ai_insights) : row.ai_insights || {},
    started_at: row.started_at,
    completed_at: row.completed_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// Type-safe insert type
type WorkflowExecutionInsert = {
  workflow_template_id: string;
  association_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  execution_data: Record<string, any>;
  performance_metrics: Record<string, any>;
  ai_insights: Record<string, any>;
};

export class IntelligentWorkflowEngine {
  async createWorkflowTemplate(templateData: {
    name?: string;
    description?: string;
    workflow_type?: string;
    template_data?: Record<string, any>;
    is_ai_recommended?: boolean;
    created_by?: string;
  }): Promise<WorkflowTemplate> {
    const insertData = {
      name: templateData.name,
      description: templateData.description,
      type: templateData.workflow_type,
      steps: templateData.template_data,
      status: 'active',
      is_template: true,
      is_popular: templateData.is_ai_recommended || false,
      created_by: templateData.created_by
    };

    const { data, error } = await supabase
      .from('workflows')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create workflow template: ${error.message}`);
    }

    return convertToWorkflowTemplate(data);
  }

  async executeWorkflow(templateId: string, associationId: string, executionData: Record<string, any>): Promise<WorkflowExecution> {
    const insertData: WorkflowExecutionInsert = {
      workflow_template_id: templateId,
      association_id: associationId,
      status: 'pending',
      execution_data: executionData,
      performance_metrics: {},
      ai_insights: {}
    };

    const { data, error } = await supabase
      .from('workflow_executions')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      devLog.error('Failed to execute workflow', error);
      throw new Error(`Failed to execute workflow: ${error.message}`);
    }

    return convertToWorkflowExecution(data);
  }

  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('is_template', true)
      .order('created_at', { ascending: false });

    if (error) {
      devLog.error('Failed to fetch workflow templates', error);
      throw new Error(`Failed to fetch workflow templates: ${error.message}`);
    }

    return data ? data.map(convertToWorkflowTemplate) : [];
  }

  async getAIRecommendedTemplates(associationId: string): Promise<WorkflowTemplate[]> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('is_template', true)
      .eq('is_popular', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(`Failed to fetch AI recommended templates: ${error.message}`);
    }

    return data ? data.map(convertToWorkflowTemplate) : [];
  }

  async optimizeWorkflowTemplate(templateId: string): Promise<WorkflowTemplate> {
    const updateData = {
      is_popular: true,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('workflows')
      .update(updateData)
      .eq('id', templateId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to optimize workflow template: ${error.message}`);
    }

    return convertToWorkflowTemplate(data);
  }

  async getWorkflowExecutions(associationId: string): Promise<WorkflowExecution[]> {
    const { data, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('association_id', associationId)
      .order('created_at', { ascending: false });

    if (error) {
      devLog.error('Failed to fetch workflow executions', error);
      throw new Error(`Failed to fetch workflow executions: ${error.message}`);
    }

    return data ? data.map(convertToWorkflowExecution) : [];
  }

  async updateWorkflowExecution(executionId: string, updates: {
    status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    execution_data?: Record<string, any>;
    performance_metrics?: Record<string, any>;
    ai_insights?: Record<string, any>;
    completed_at?: string;
  }): Promise<WorkflowExecution> {
    // Step 1: Update the record without selecting
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('workflow_executions')
      .update(updateData)
      .eq('id', executionId);

    if (updateError) {
      throw new Error(`Failed to update workflow execution: ${updateError.message}`);
    }

    // Step 2: Fetch the updated record separately
    const { data, error: fetchError } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', executionId)
      .single();

    if (fetchError || !data) {
      throw new Error(`Failed to fetch updated workflow execution: ${fetchError?.message}`);
    }

    return convertToWorkflowExecution(data);
  }
}

export const intelligentWorkflowEngine = new IntelligentWorkflowEngine();
