
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';
import { WorkflowTemplate, WorkflowExecution, WorkflowAnalytic } from '@/types/ai-workflow-types';

// Helper function to convert database row to WorkflowTemplate
function convertToWorkflowTemplate(data: any): WorkflowTemplate {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    category: data.category || 'general',
    workflow_type: data.workflow_type || 'standard',
    template_data: data.template_data || {},
    ai_optimization_score: data.ai_optimization_score || 0,
    usage_count: data.usage_count || 0,
    is_ai_recommended: data.is_ai_recommended || false,
    created_by: data.created_by,
    association_id: data.association_id,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

// Helper function to convert database row to WorkflowExecution
function convertToWorkflowExecution(data: any): WorkflowExecution {
  return {
    id: data.id,
    workflow_template_id: data.workflow_template_id,
    association_id: data.association_id,
    status: data.status as 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
    execution_data: data.execution_data || {},
    performance_metrics: data.performance_metrics || {},
    ai_insights: data.ai_insights || {},
    started_at: data.started_at,
    completed_at: data.completed_at,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

export class IntelligentWorkflowEngine {
  private static instance: IntelligentWorkflowEngine;

  static getInstance(): IntelligentWorkflowEngine {
    if (!IntelligentWorkflowEngine.instance) {
      IntelligentWorkflowEngine.instance = new IntelligentWorkflowEngine();
    }
    return IntelligentWorkflowEngine.instance;
  }

  async createWorkflowTemplate(templateData: Omit<WorkflowTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<WorkflowTemplate> {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .insert({
          name: templateData.name,
          description: templateData.description,
          category: templateData.category,
          workflow_type: templateData.workflow_type,
          template_data: templateData.template_data,
          ai_optimization_score: templateData.ai_optimization_score,
          usage_count: templateData.usage_count,
          is_ai_recommended: templateData.is_ai_recommended,
          created_by: templateData.created_by,
          association_id: templateData.association_id
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create workflow template: ${error.message}`);
      }

      devLog.info('Workflow template created successfully', { templateId: data.id });
      return convertToWorkflowTemplate(data);
    } catch (error) {
      devLog.error('Failed to create workflow template', error);
      throw error;
    }
  }

  async executeWorkflow(templateId: string, associationId: string, executionData: Record<string, any>): Promise<WorkflowExecution> {
    try {
      const { data, error } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_template_id: templateId,
          association_id: associationId,
          status: 'pending',
          execution_data: executionData
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to start workflow execution: ${error.message}`);
      }

      devLog.info('Workflow execution started', { executionId: data.id, templateId });
      return convertToWorkflowExecution(data);
    } catch (error) {
      devLog.error('Failed to execute workflow', error);
      throw error;
    }
  }

  async updateExecutionStatus(executionId: string, status: 'running' | 'completed' | 'failed' | 'cancelled', insights?: Record<string, any>): Promise<WorkflowExecution> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed' || status === 'failed') {
        updateData.completed_at = new Date().toISOString();
      }

      if (insights) {
        updateData.ai_insights = insights;
      }

      const { data, error } = await supabase
        .from('workflow_executions')
        .update(updateData)
        .eq('id', executionId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update execution status: ${error.message}`);
      }

      devLog.info('Workflow execution status updated', { executionId, status });
      return convertToWorkflowExecution(data);
    } catch (error) {
      devLog.error('Failed to update execution status', error);
      throw error;
    }
  }

  async getWorkflowTemplates(associationId: string): Promise<WorkflowTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('association_id', associationId)
        .order('usage_count', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch workflow templates: ${error.message}`);
      }

      return data.map(convertToWorkflowTemplate);
    } catch (error) {
      devLog.error('Failed to get workflow templates', error);
      throw error;
    }
  }

  async getActiveExecutions(associationId: string): Promise<WorkflowExecution[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('association_id', associationId)
        .in('status', ['pending', 'running'])
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch active executions: ${error.message}`);
      }

      return data.map(convertToWorkflowExecution);
    } catch (error) {
      devLog.error('Failed to get active executions', error);
      throw error;
    }
  }

  async recordAnalytics(executionId: string, associationId: string, metrics: Record<string, number>): Promise<void> {
    try {
      const analyticsData = Object.entries(metrics).map(([metricName, metricValue]) => ({
        workflow_execution_id: executionId,
        association_id: associationId,
        metric_name: metricName,
        metric_value: metricValue,
        metric_type: 'performance',
        measurement_date: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('workflow_analytics')
        .insert(analyticsData);

      if (error) {
        throw new Error(`Failed to record analytics: ${error.message}`);
      }

      devLog.info('Workflow analytics recorded', { executionId, metricsCount: analyticsData.length });
    } catch (error) {
      devLog.error('Failed to record analytics', error);
      throw error;
    }
  }

  async optimizeWorkflow(templateId: string): Promise<{ optimizedTemplate: WorkflowTemplate; improvements: string[] }> {
    try {
      // Get execution history for this template
      const { data: executions, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_template_id', templateId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw new Error(`Failed to fetch execution history: ${error.message}`);
      }

      // AI-powered optimization logic would go here
      // For now, we'll return mock improvements
      const improvements = [
        'Reduced average execution time by 15%',
        'Optimized resource allocation',
        'Improved error handling',
        'Enhanced performance monitoring'
      ];

      // Get the original template
      const { data: template, error: templateError } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) {
        throw new Error(`Failed to fetch template: ${templateError.message}`);
      }

      // Update optimization score
      const optimizedTemplate = {
        ...convertToWorkflowTemplate(template),
        ai_optimization_score: template.ai_optimization_score + 10
      };

      await supabase
        .from('workflow_templates')
        .update({ ai_optimization_score: optimizedTemplate.ai_optimization_score })
        .eq('id', templateId);

      devLog.info('Workflow optimized', { templateId, improvements: improvements.length });

      return {
        optimizedTemplate,
        improvements
      };
    } catch (error) {
      devLog.error('Failed to optimize workflow', error);
      throw error;
    }
  }

  async generateAIRecommendations(associationId: string): Promise<WorkflowTemplate[]> {
    try {
      // This would integrate with AI service to analyze patterns and suggest workflows
      // For now, return templates marked as AI-recommended
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('is_ai_recommended', true)
        .order('ai_optimization_score', { ascending: false })
        .limit(10);

      if (error) {
        throw new Error(`Failed to generate AI recommendations: ${error.message}`);
      }

      devLog.info('AI recommendations generated', { associationId, count: data.length });
      return data.map(convertToWorkflowTemplate);
    } catch (error) {
      devLog.error('Failed to generate AI recommendations', error);
      throw error;
    }
  }
}

export const intelligentWorkflowEngine = IntelligentWorkflowEngine.getInstance();
