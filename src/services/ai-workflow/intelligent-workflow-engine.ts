
import { supabase } from '@/integrations/supabase/client';
import { WorkflowTemplate, WorkflowExecution } from '@/types/ai-workflow-types';
import { devLog } from '@/utils/dev-logger';

// Helper functions to convert database rows to our types
function convertToWorkflowTemplate(row: any): WorkflowTemplate {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    workflow_type: row.workflow_type,
    template_data: typeof row.template_data === 'string' 
      ? JSON.parse(row.template_data) 
      : row.template_data || {},
    ai_optimization_score: row.ai_optimization_score || 0,
    usage_count: row.usage_count || 0,
    is_ai_recommended: row.is_ai_recommended || false,
    created_by: row.created_by,
    association_id: row.association_id,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function convertToWorkflowExecution(row: any): WorkflowExecution {
  return {
    id: row.id,
    workflow_template_id: row.workflow_template_id,
    association_id: row.association_id,
    status: row.status as 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
    execution_data: typeof row.execution_data === 'string'
      ? JSON.parse(row.execution_data)
      : row.execution_data || {},
    performance_metrics: typeof row.performance_metrics === 'string'
      ? JSON.parse(row.performance_metrics)
      : row.performance_metrics || {},
    ai_insights: typeof row.ai_insights === 'string'
      ? JSON.parse(row.ai_insights)
      : row.ai_insights || {},
    started_at: row.started_at,
    completed_at: row.completed_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export class IntelligentWorkflowEngine {
  async createWorkflowTemplate(templateData: Omit<WorkflowTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<Workflow
Template> {
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

    return convertToWorkflowTemplate(data);
  }

  async getWorkflowTemplates(associationId?: string): Promise<WorkflowTemplate[]> {
    let query = supabase.from('workflow_templates').select('*');
    
    if (associationId) {
      query = query.eq('association_id', associationId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch workflow templates: ${error.message}`);
    }

    return data ? data.map(convertToWorkflowTemplate) : [];
  }

  async executeWorkflow(templateId: string, associationId: string, executionData: Record<string, any>): Promise<WorkflowExecution> {
    try {
      devLog.info(`Starting workflow execution for template ${templateId}`);

      // Create execution record
      const { data: executionRecord, error: createError } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_template_id: templateId,
          association_id: associationId,
          status: 'running',
          execution_data: executionData,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create workflow execution: ${createError.message}`);
      }

      const execution = convertToWorkflowExecution(executionRecord);

      // Execute workflow steps (simplified for demo)
      try {
        await this.processWorkflowSteps(execution);
        
        // Update execution as completed
        const { data: updatedExecution, error: updateError } = await supabase
          .from('workflow_executions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            performance_metrics: { executionTime: Date.now() - new Date(execution.started_at!).getTime() }
          })
          .eq('id', execution.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Failed to update workflow execution: ${updateError.message}`);
        }

        return convertToWorkflowExecution(updatedExecution);
      } catch (processingError) {
        // Update execution as failed
        await supabase
          .from('workflow_executions')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            ai_insights: { error: processingError.message }
          })
          .eq('id', execution.id);

        throw processingError;
      }
    } catch (error) {
      devLog.error(`Workflow execution failed for template ${templateId}`, error);
      throw error;
    }
  }

  private async processWorkflowSteps(execution: WorkflowExecution): Promise<void> {
    // Get the workflow template
    const { data: template, error } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('id', execution.workflow_template_id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch workflow template: ${error.message}`);
    }

    const templateData = convertToWorkflowTemplate(template);
    const steps = templateData.template_data.steps || [];

    devLog.info(`Processing ${steps.length} workflow steps`);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      devLog.info(`Executing step ${i + 1}: ${step.name}`);
      
      // Simulate step execution
      await this.executeWorkflowStep(step, execution.execution_data);
    }
  }

  private async executeWorkflowStep(step: any, executionData: Record<string, any>): Promise<void> {
    // Simulate different types of workflow steps
    switch (step.type) {
      case 'notification':
        await this.sendNotification(step.config, executionData);
        break;
      case 'data_processing':
        await this.processData(step.config, executionData);
        break;
      case 'approval':
        await this.requestApproval(step.config, executionData);
        break;
      case 'integration':
        await this.callIntegration(step.config, executionData);
        break;
      default:
        devLog.warn(`Unknown step type: ${step.type}`);
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async sendNotification(config: any, executionData: Record<string, any>): Promise<void> {
    devLog.info('Sending notification', { config, executionData });
    // Implementation for sending notifications
  }

  private async processData(config: any, executionData: Record<string, any>): Promise<void> {
    devLog.info('Processing data', { config, executionData });
    // Implementation for data processing
  }

  private async requestApproval(config: any, executionData: Record<string, any>): Promise<void> {
    devLog.info('Requesting approval', { config, executionData });
    // Implementation for approval requests
  }

  private async callIntegration(config: any, executionData: Record<string, any>): Promise<void> {
    devLog.info('Calling integration', { config, executionData });
    // Implementation for external integrations
  }

  async getWorkflowExecutions(associationId: string, filters?: {
    status?: string;
    templateId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<WorkflowExecution[]> {
    let query = supabase
      .from('workflow_executions')
      .select('*')
      .eq('association_id', associationId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.templateId) {
      query = query.eq('workflow_template_id', filters.templateId);
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch workflow executions: ${error.message}`);
    }

    return data ? data.map(convertToWorkflowExecution) : [];
  }

  async getWorkflowAnalytics(associationId: string): Promise<any> {
    const executions = await this.getWorkflowExecutions(associationId);
    const templates = await this.getWorkflowTemplates(associationId);

    const analytics = {
      totalExecutions: executions.length,
      successfulExecutions: executions.filter(e => e.status === 'completed').length,
      failedExecutions: executions.filter(e => e.status === 'failed').length,
      averageExecutionTime: this.calculateAverageExecutionTime(executions),
      mostUsedTemplates: this.getMostUsedTemplates(templates, executions),
      executionTrends: this.getExecutionTrends(executions),
      performanceMetrics: this.getPerformanceMetrics(executions)
    };

    return analytics;
  }

  private calculateAverageExecutionTime(executions: WorkflowExecution[]): number {
    const completedExecutions = executions.filter(e => 
      e.status === 'completed' && e.started_at && e.completed_at
    );

    if (completedExecutions.length === 0) return 0;

    const totalTime = completedExecutions.reduce((sum, execution) => {
      const startTime = new Date(execution.started_at!).getTime();
      const endTime = new Date(execution.completed_at!).getTime();
      return sum + (endTime - startTime);
    }, 0);

    return totalTime / completedExecutions.length;
  }

  private getMostUsedTemplates(templates: WorkflowTemplate[], executions: WorkflowExecution[]): any[] {
    const templateUsage: Record<string, { template: WorkflowTemplate; count: number }> = {};

    templates.forEach(template => {
      templateUsage[template.id] = { template, count: 0 };
    });

    executions.forEach(execution => {
      if (templateUsage[execution.workflow_template_id]) {
        templateUsage[execution.workflow_template_id].count++;
      }
    });

    return Object.values(templateUsage)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getExecutionTrends(executions: WorkflowExecution[]): any[] {
    const dailyData: Record<string, any> = {};

    executions.forEach(execution => {
      const date = execution.created_at.split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, total: 0, successful: 0, failed: 0 };
      }
      dailyData[date].total++;
      if (execution.status === 'completed') {
        dailyData[date].successful++;
      } else if (execution.status === 'failed') {
        dailyData[date].failed++;
      }
    });

    return Object.values(dailyData).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }

  private getPerformanceMetrics(executions: WorkflowExecution[]): any {
    const now = new Date();
    const last24Hours = executions.filter(e => 
      new Date(e.created_at).getTime() > now.getTime() - 24 * 60 * 60 * 1000
    );
    const last7Days = executions.filter(e => 
      new Date(e.created_at).getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000
    );

    return {
      last24Hours: {
        total: last24Hours.length,
        successful: last24Hours.filter(e => e.status === 'completed').length,
        failed: last24Hours.filter(e => e.status === 'failed').length
      },
      last7Days: {
        total: last7Days.length,
        successful: last7Days.filter(e => e.status === 'completed').length,
        failed: last7Days.filter(e => e.status === 'failed').length
      }
    };
  }

  async optimizeWorkflowTemplate(templateId: string): Promise<WorkflowTemplate> {
    // Get execution history for this template
    const { data: executions, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('workflow_template_id', templateId);

    if (error) {
      throw new Error(`Failed to fetch execution history: ${error.message}`);
    }

    // Analyze performance and generate optimization suggestions
    const optimizations = this.generateOptimizations(executions || []);
    
    // Update template with AI optimization score
    const { data: updatedTemplate, error: updateError } = await supabase
      .from('workflow_templates')
      .update({
        ai_optimization_score: optimizations.score,
        template_data: optimizations.optimizedTemplate
      })
      .eq('id', templateId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update workflow template: ${updateError.message}`);
    }

    return convertToWorkflowTemplate(updatedTemplate);
  }

  private generateOptimizations(executions: any[]): any {
    // Simple optimization logic - can be enhanced with ML
    const successRate = executions.length > 0 
      ? executions.filter(e => e.status === 'completed').length / executions.length 
      : 1;

    const averageTime = executions.length > 0
      ? executions.reduce((sum, e) => {
          if (e.started_at && e.completed_at) {
            return sum + (new Date(e.completed_at).getTime() - new Date(e.started_at).getTime());
          }
          return sum;
        }, 0) / executions.length
      : 0;

    const score = Math.round((successRate * 0.7 + (averageTime > 0 ? Math.min(1, 10000 / averageTime) : 1) * 0.3) * 100);

    return {
      score,
      optimizedTemplate: {
        // Template optimizations would go here
        optimizations: [
          'Parallel execution where possible',
          'Reduce unnecessary wait times',
          'Optimize step ordering'
        ]
      }
    };
  }

  async updateWorkflowTemplate(templateId: string, updates: Partial<WorkflowTemplate>): Promise<WorkflowTemplate> {
    const { data, error } = await supabase
      .from('workflow_templates')
      .update(updates)
      .eq('id', templateId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update workflow template: ${error.message}`);
    }

    return convertToWorkflowTemplate(data);
  }

  async deleteWorkflowTemplate(templateId: string): Promise<void> {
    const { error } = await supabase
      .from('workflow_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      throw new Error(`Failed to delete workflow template: ${error.message}`);
    }
  }
}

export const intelligentWorkflowEngine = new IntelligentWorkflowEngine();
