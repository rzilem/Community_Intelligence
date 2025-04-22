
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormWorkflow, FormWorkflowStep, FormWorkflowAction } from '@/types/form-workflow-types';
import { toast } from 'sonner';

interface ExecutionOptions {
  formData: Record<string, any>;
  userId?: string;
  associationId?: string;
}

export function useWorkflowExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const executeWorkflow = async (workflow: FormWorkflow, options: ExecutionOptions): Promise<boolean> => {
    if (!workflow || !workflow.isEnabled || workflow.steps.length === 0) {
      return false;
    }

    setIsExecuting(true);
    setResults([]);
    
    try {
      // Execute each enabled step
      const enabledSteps = workflow.steps.filter(step => step.isEnabled);
      
      for (const step of enabledSteps) {
        // Check if step conditions are met
        const conditionsMet = evaluateConditions(step, options.formData);
        
        if (!conditionsMet) {
          // Skip this step
          setResults(prev => [...prev, {
            stepId: step.id,
            actionId: 'conditions',
            success: false,
            message: 'Conditions not met, step skipped'
          }]);
          continue;
        }
        
        // Execute all actions in the step
        for (const action of step.actions) {
          try {
            const result = await executeAction(action, {
              formData: options.formData,
              userId: options.userId,
              associationId: options.associationId
            });
            
            setResults(prev => [...prev, {
              stepId: step.id,
              actionId: action.id,
              success: true,
              message: `Successfully executed ${action.name}`,
              details: result
            }]);
          } catch (error) {
            console.error(`Error executing action ${action.name}:`, error);
            
            setResults(prev => [...prev, {
              stepId: step.id,
              actionId: action.id,
              success: false,
              message: `Failed to execute ${action.name}: ${error.message || 'Unknown error'}`,
              error: error.message
            }]);
            
            // Log the error to the database
            await logExecution({
              workflowId: workflow.id,
              submissionId: options.formData.submissionId,
              stepId: step.id,
              actionId: action.id,
              status: 'failed',
              details: {
                error: error.message,
                action: action
              }
            });
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error('Failed to execute workflow');
      return false;
    } finally {
      setIsExecuting(false);
    }
  };

  // Helper function to evaluate step conditions
  const evaluateConditions = (step: FormWorkflowStep, formData: Record<string, any>): boolean => {
    // If no conditions, always run the step
    if (!step.conditions || step.conditions.length === 0) {
      return true;
    }
    
    // All conditions must be met
    return step.conditions.every(condition => {
      const fieldValue = getNestedValue(formData, condition.field);
      
      switch (condition.operator) {
        case 'equals':
          return String(fieldValue) === String(condition.value);
        case 'not_equals':
          return String(fieldValue) !== String(condition.value);
        case 'contains':
          return String(fieldValue).includes(String(condition.value));
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        default:
          return false;
      }
    });
  };

  // Helper function to get nested values using dot notation
  const getNestedValue = (obj: Record<string, any>, path: string): any => {
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : undefined;
    }, obj);
  };

  // Execute a single action
  const executeAction = async (action: FormWorkflowAction, context: ExecutionOptions): Promise<any> => {
    // Replace variables in config values
    const processedConfig = processVariables(action.config, context);
    
    switch (action.type) {
      case 'send_email':
        // In a real implementation, call your email service here
        console.log('Sending email:', processedConfig);
        return { sent: true, to: processedConfig.to };
        
      case 'send_notification':
        // Create a notification in the database
        const { data, error } = await supabase
          .from('portal_notifications')
          .insert({
            title: processedConfig.title || 'Form Notification',
            content: processedConfig.message,
            type: 'form_submission',
            user_id: processedConfig.userId || context.userId,
            association_id: context.associationId,
            metadata: {
              form_data: context.formData
            }
          });
          
        if (error) throw error;
        return data;
        
      case 'create_request':
        // Create a homeowner request
        const { data: request, error: requestError } = await supabase
          .from('homeowner_requests')
          .insert({
            title: processedConfig.title || 'Form Request',
            description: processedConfig.description || context.formData.description,
            type: processedConfig.requestType || 'general',
            status: 'open',
            priority: processedConfig.priority || 'medium',
            resident_id: context.userId,
            association_id: context.associationId
          });
          
        if (requestError) throw requestError;
        return request;
        
      case 'update_status':
        // Update the form submission status
        if (context.formData.submissionId) {
          const { data: updated, error: updateError } = await supabase
            .from('form_submissions')
            .update({ status: processedConfig.status })
            .eq('id', context.formData.submissionId);
            
          if (updateError) throw updateError;
          return updated;
        }
        return { message: 'No submission ID provided, status not updated' };
        
      case 'webhook':
        // Call a webhook
        if (!processedConfig.url) {
          throw new Error('Webhook URL is required');
        }
        
        const webhookResponse = await fetch(processedConfig.url, {
          method: processedConfig.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(context.formData)
        });
        
        if (!webhookResponse.ok) {
          throw new Error(`Webhook returned ${webhookResponse.status}`);
        }
        
        return { status: webhookResponse.status };
        
      default:
        throw new Error(`Unsupported action type: ${action.type}`);
    }
  };

  // Process variables in config strings
  const processVariables = (config: Record<string, any>, context: ExecutionOptions): Record<string, any> => {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'string') {
        // Replace placeholders like {{form.title}} with actual values
        result[key] = value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
          if (path === 'user.email') return context.userId || '';
          if (path === 'form.title') return context.formData.title || '';
          
          return getNestedValue(context.formData, path) || match;
        });
      } else {
        result[key] = value;
      }
    }
    
    return result;
  };

  // Log execution to the database
  const logExecution = async (logData: {
    workflowId: string;
    submissionId: string;
    stepId: string;
    actionId: string;
    status: 'success' | 'failed' | 'pending';
    details?: any;
  }) => {
    try {
      await supabase
        .from('form_workflow_execution_logs')
        .insert(logData);
    } catch (error) {
      console.error('Error logging workflow execution:', error);
    }
  };

  return {
    executeWorkflow,
    isExecuting,
    results
  };
}
