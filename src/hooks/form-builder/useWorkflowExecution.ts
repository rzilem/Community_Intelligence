
import { supabase } from '@/integrations/supabase/client';
import { FormWorkflow } from '@/types/form-workflow-types';
import { toast } from 'sonner';

interface WorkflowContext {
  formData: Record<string, any>;
  userId: string;
  associationId?: string;
}

export function useWorkflowExecution() {
  const executeWorkflow = async (workflow: FormWorkflow, context: WorkflowContext) => {
    if (!workflow.isEnabled) return;
    
    try {
      console.log(`Executing workflow: ${workflow.name}`);
      
      // Execute each workflow step
      for (const step of workflow.steps) {
        if (!step.isEnabled) continue;
        
        // Check if step conditions are met
        const conditionsMet = evaluateStepConditions(step.conditions, context.formData);
        if (!conditionsMet) {
          console.log(`Skipping step ${step.name} - conditions not met`);
          continue;
        }
        
        // Execute actions in order
        const sortedActions = [...step.actions].sort((a, b) => a.order - b.order);
        
        for (const action of sortedActions) {
          await executeAction(action, context);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error executing workflow:', error);
      return false;
    }
  };
  
  const evaluateStepConditions = (conditions: any[], formData: Record<string, any>): boolean => {
    // If no conditions, always execute
    if (!conditions || conditions.length === 0) return true;
    
    // All conditions must be met (AND logic)
    return conditions.every(condition => {
      const fieldValue = formData[condition.field];
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
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
  
  const executeAction = async (action: any, context: WorkflowContext) => {
    try {
      console.log(`Executing action: ${action.name} (${action.type})`);
      
      switch (action.type) {
        case 'send_email':
          // Email sending logic would go here
          console.log('Would send email with:', action.config);
          break;
          
        case 'send_notification':
          await createNotification({
            userId: context.userId,
            associationId: context.associationId,
            title: replaceVariables(action.config.title, context.formData),
            content: replaceVariables(action.config.content, context.formData),
            type: action.config.notificationType || 'info'
          });
          break;
          
        case 'create_request':
          // Create a request based on form data
          if (context.associationId) {
            await createHomeownerRequest({
              ...action.config,
              formData: context.formData,
              userId: context.userId,
              associationId: context.associationId
            });
          }
          break;
          
        default:
          console.log(`Action type ${action.type} not implemented`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error executing action ${action.name}:`, error);
      return false;
    }
  };
  
  const createNotification = async ({ userId, associationId, title, content, type }: any) => {
    try {
      await supabase.from('portal_notifications').insert({
        user_id: userId,
        association_id: associationId,
        title,
        content, 
        type
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };
  
  const createHomeownerRequest = async ({ formData, userId, associationId, ...config }: any) => {
    try {
      // Generate tracking number
      const year = new Date().getFullYear();
      const random = Math.floor(10000 + Math.random() * 90000);
      const trackingNumber = `REQ-${year}-${random}`;
      
      // Create homeowner request
      await supabase.from('homeowner_requests').insert({
        title: formData.title || formData.subject || config.defaultTitle || 'New Request',
        description: formData.description || formData.message || '',
        type: formData.type || config.defaultType || 'general',
        priority: formData.priority || config.defaultPriority || 'medium',
        status: 'open',
        resident_id: userId,
        association_id: associationId,
        tracking_number: trackingNumber
      });
    } catch (error) {
      console.error('Error creating homeowner request:', error);
    }
  };
  
  const replaceVariables = (text: string, data: Record<string, any>): string => {
    if (!text) return '';
    
    return text.replace(/\{([^}]+)\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  };
  
  return {
    executeWorkflow
  };
}
