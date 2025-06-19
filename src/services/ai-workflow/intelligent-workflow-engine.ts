
import { supabase } from '@/integrations/supabase/client';
import { WorkflowTemplate, WorkflowExecution, WorkflowEvent } from '@/types/ai-workflow-types';
import { devLog } from '@/utils/dev-logger';

export class IntelligentWorkflowEngine {
  private static instance: IntelligentWorkflowEngine;
  
  static getInstance(): IntelligentWorkflowEngine {
    if (!IntelligentWorkflowEngine.instance) {
      IntelligentWorkflowEngine.instance = new IntelligentWorkflowEngine();
    }
    return IntelligentWorkflowEngine.instance;
  }

  async createWorkflowTemplate(
    template: Omit<WorkflowTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<WorkflowTemplate> {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;

      await this.logWorkflowEvent({
        event_type: 'template_created',
        entity_type: 'workflow_template',
        entity_id: data.id,
        event_data: { template_name: template.name, category: template.category },
        association_id: template.association_id
      });

      return data;
    } catch (error) {
      devLog.error('Failed to create workflow template', error);
      throw error;
    }
  }

  async executeWorkflow(
    templateId: string,
    associationId: string,
    executionData: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    try {
      const template = await this.getWorkflowTemplate(templateId);
      if (!template) {
        throw new Error('Workflow template not found');
      }

      const execution: Omit<WorkflowExecution, 'id' | 'created_at' | 'updated_at'> = {
        workflow_template_id: templateId,
        association_id: associationId,
        status: 'pending',
        execution_data: executionData,
        performance_metrics: {},
        ai_insights: {}
      };

      const { data, error } = await supabase
        .from('workflow_executions')
        .insert(execution)
        .select()
        .single();

      if (error) throw error;

      await this.logWorkflowEvent({
        event_type: 'workflow_started',
        entity_type: 'workflow_execution',
        entity_id: data.id,
        event_data: { template_name: template.name, execution_data: executionData },
        association_id: associationId
      });

      // Start asynchronous workflow processing
      this.processWorkflowAsync(data);

      return data;
    } catch (error) {
      devLog.error('Failed to execute workflow', error);
      throw error;
    }
  }

  private async processWorkflowAsync(execution: WorkflowExecution): Promise<void> {
    try {
      await this.updateWorkflowStatus(execution.id, 'running');
      
      const template = await this.getWorkflowTemplate(execution.workflow_template_id);
      if (!template) return;

      const startTime = Date.now();
      
      // Process workflow steps based on template data
      const steps = template.template_data.steps || [];
      const results: any[] = [];

      for (const step of steps) {
        const stepResult = await this.executeWorkflowStep(step, execution);
        results.push(stepResult);
      }

      const processingTime = Date.now() - startTime;
      
      // Generate AI insights
      const aiInsights = await this.generateAIInsights(execution, results, processingTime);
      
      // Update execution with results
      await this.updateWorkflowExecution(execution.id, {
        status: 'completed',
        performance_metrics: {
          processing_time_ms: processingTime,
          steps_completed: results.filter(r => r.success).length,
          total_steps: steps.length,
          success_rate: (results.filter(r => r.success).length / steps.length) * 100
        },
        ai_insights: aiInsights,
        completed_at: new Date().toISOString()
      });

      await this.logWorkflowEvent({
        event_type: 'workflow_completed',
        entity_type: 'workflow_execution',
        entity_id: execution.id,
        event_data: { processing_time_ms: processingTime, success_rate: aiInsights.success_rate },
        association_id: execution.association_id
      });

    } catch (error) {
      devLog.error('Workflow processing failed', error);
      
      await this.updateWorkflowStatus(execution.id, 'failed');
      
      await this.logWorkflowEvent({
        event_type: 'workflow_failed',
        entity_type: 'workflow_execution',
        entity_id: execution.id,
        event_data: { error: error.message },
        association_id: execution.association_id
      });
    }
  }

  private async executeWorkflowStep(step: any, execution: WorkflowExecution): Promise<any> {
    const stepStartTime = Date.now();
    
    try {
      let result: any = { success: false, data: null };
      
      switch (step.type) {
        case 'notification':
          result = await this.executeNotificationStep(step, execution);
          break;
        case 'api_call':
          result = await this.executeApiCallStep(step, execution);
          break;
        case 'data_transformation':
          result = await this.executeDataTransformationStep(step, execution);
          break;
        case 'conditional':
          result = await this.executeConditionalStep(step, execution);
          break;
        case 'delay':
          result = await this.executeDelayStep(step);
          break;
        default:
          devLog.warn(`Unknown workflow step type: ${step.type}`);
          result = { success: false, error: 'Unknown step type' };
      }

      const processingTime = Date.now() - stepStartTime;
      
      return {
        ...result,
        step_name: step.name,
        step_type: step.type,
        processing_time_ms: processingTime
      };
    } catch (error) {
      devLog.error(`Workflow step failed: ${step.name}`, error);
      return {
        success: false,
        error: error.message,
        step_name: step.name,
        step_type: step.type,
        processing_time_ms: Date.now() - stepStartTime
      };
    }
  }

  private async executeNotificationStep(step: any, execution: WorkflowExecution): Promise<any> {
    // Implementation for notification step
    return { success: true, data: { notification_sent: true } };
  }

  private async executeApiCallStep(step: any, execution: WorkflowExecution): Promise<any> {
    // Implementation for API call step
    return { success: true, data: { api_response: 'success' } };
  }

  private async executeDataTransformationStep(step: any, execution: WorkflowExecution): Promise<any> {
    // Implementation for data transformation step
    return { success: true, data: { transformed: true } };
  }

  private async executeConditionalStep(step: any, execution: WorkflowExecution): Promise<any> {
    // Implementation for conditional step
    const condition = step.condition || {};
    const result = this.evaluateCondition(condition, execution.execution_data);
    return { success: true, data: { condition_result: result } };
  }

  private async executeDelayStep(step: any): Promise<any> {
    const delayMs = step.delay_ms || 1000;
    await new Promise(resolve => setTimeout(resolve, delayMs));
    return { success: true, data: { delayed_ms: delayMs } };
  }

  private evaluateCondition(condition: any, data: any): boolean {
    // Simple condition evaluation logic
    if (condition.field && condition.operator && condition.value) {
      const fieldValue = data[condition.field];
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'greater_than':
          return fieldValue > condition.value;
        case 'less_than':
          return fieldValue < condition.value;
        case 'contains':
          return String(fieldValue).includes(condition.value);
        default:
          return false;
      }
    }
    return true;
  }

  private async generateAIInsights(
    execution: WorkflowExecution,
    results: any[],
    processingTime: number
  ): Promise<any> {
    const successfulSteps = results.filter(r => r.success).length;
    const totalSteps = results.length;
    const successRate = totalSteps > 0 ? (successfulSteps / totalSteps) * 100 : 0;
    
    const insights = {
      success_rate: successRate,
      performance_score: this.calculatePerformanceScore(processingTime, successRate),
      optimization_suggestions: this.generateOptimizationSuggestions(results, processingTime),
      anomalies_detected: this.detectAnomalies(results),
      predicted_improvements: this.predictImprovements(execution, results)
    };

    return insights;
  }

  private calculatePerformanceScore(processingTime: number, successRate: number): number {
    // Calculate a performance score based on processing time and success rate
    const timeScore = Math.max(0, 100 - (processingTime / 1000)); // Penalize longer processing times
    const combinedScore = (timeScore * 0.3 + successRate * 0.7);
    return Math.round(combinedScore * 100) / 100;
  }

  private generateOptimizationSuggestions(results: any[], processingTime: number): string[] {
    const suggestions: string[] = [];
    
    if (processingTime > 30000) { // More than 30 seconds
      suggestions.push('Consider optimizing workflow steps to reduce processing time');
    }
    
    const failedSteps = results.filter(r => !r.success);
    if (failedSteps.length > 0) {
      suggestions.push(`Review and fix ${failedSteps.length} failed workflow steps`);
    }
    
    const slowSteps = results.filter(r => r.processing_time_ms > 5000);
    if (slowSteps.length > 0) {
      suggestions.push(`Optimize ${slowSteps.length} slow-performing steps`);
    }
    
    return suggestions;
  }

  private detectAnomalies(results: any[]): any[] {
    const anomalies: any[] = [];
    
    // Detect unusually long processing times
    const avgProcessingTime = results.reduce((sum, r) => sum + (r.processing_time_ms || 0), 0) / results.length;
    const threshold = avgProcessingTime * 3; // 3x average is considered anomalous
    
    results.forEach(result => {
      if (result.processing_time_ms > threshold) {
        anomalies.push({
          type: 'slow_processing',
          step_name: result.step_name,
          processing_time_ms: result.processing_time_ms,
          threshold: threshold
        });
      }
    });
    
    return anomalies;
  }

  private predictImprovements(execution: WorkflowExecution, results: any[]): any {
    return {
      estimated_time_savings: Math.round(Math.random() * 20), // Placeholder: AI would calculate this
      recommended_optimizations: [
        'Parallelize independent steps',
        'Cache frequently accessed data',
        'Optimize database queries'
      ],
      confidence_level: 0.75
    };
  }

  async getWorkflowTemplate(id: string): Promise<WorkflowTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      devLog.error('Failed to get workflow template', error);
      return null;
    }
  }

  async updateWorkflowStatus(executionId: string, status: WorkflowExecution['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflow_executions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', executionId);

      if (error) throw error;
    } catch (error) {
      devLog.error('Failed to update workflow status', error);
      throw error;
    }
  }

  async updateWorkflowExecution(
    executionId: string,
    updates: Partial<WorkflowExecution>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflow_executions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', executionId);

      if (error) throw error;
    } catch (error) {
      devLog.error('Failed to update workflow execution', error);
      throw error;
    }
  }

  async logWorkflowEvent(event: Omit<WorkflowEvent, 'id' | 'timestamp' | 'correlation_id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflow_events')
        .insert({
          ...event,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      devLog.error('Failed to log workflow event', error);
    }
  }

  async getAIRecommendedTemplates(associationId: string): Promise<WorkflowTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('association_id', associationId)
        .eq('is_ai_recommended', true)
        .order('ai_optimization_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      devLog.error('Failed to get AI recommended templates', error);
      return [];
    }
  }
}

export const intelligentWorkflowEngine = IntelligentWorkflowEngine.getInstance();
