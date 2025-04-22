
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowContext {
  formData: Record<string, any>;
  userId: string;
  associationId?: string;
}

export function useWorkflowExecution() {
  const [isExecuting, setIsExecuting] = useState(false);

  const executeWorkflow = async (workflow: any, context: WorkflowContext) => {
    if (!workflow || !workflow.id) {
      console.error('Invalid workflow provided for execution');
      return false;
    }

    setIsExecuting(true);
    
    try {
      // Execute each step in the workflow
      if (workflow.steps && Array.isArray(workflow.steps)) {
        // Execute steps in order
        for (const step of workflow.steps) {
          await executeWorkflowStep(step, context);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error executing workflow:', error);
      return false;
    } finally {
      setIsExecuting(false);
    }
  };

  const executeWorkflowStep = async (step: any, context: WorkflowContext) => {
    if (!step || !step.type) {
      console.error('Invalid workflow step', step);
      return;
    }

    switch (step.type) {
      case 'email':
        await executeEmailStep(step, context);
        break;
      case 'notification':
        await executeNotificationStep(step, context);
        break;
      case 'update':
        await executeUpdateStep(step, context);
        break;
      case 'create':
        await executeCreateStep(step, context);
        break;
      default:
        console.warn(`Unsupported workflow step type: ${step.type}`);
    }
  };

  const executeEmailStep = async (step: any, context: WorkflowContext) => {
    // Implementation for sending an email
    console.log('Executing email step:', step, 'with context:', context);
    
    // This would typically call an edge function or API to send an email
    // For now, just log it
    return true;
  };

  const executeNotificationStep = async (step: any, context: WorkflowContext) => {
    // Implementation for creating a notification
    console.log('Executing notification step:', step, 'with context:', context);
    
    if (!context.userId || !context.associationId) {
      console.error('Missing user or association ID for notification');
      return false;
    }
    
    // Create a notification record
    try {
      await supabase.from('portal_notifications').insert({
        user_id: context.userId,
        association_id: context.associationId,
        title: replaceTokens(step.title || 'New Notification', context.formData),
        content: replaceTokens(step.content || '', context.formData),
        type: step.notificationType || 'info',
        link: step.link || null,
        metadata: step.metadata || {}
      });
      
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  };

  const executeUpdateStep = async (step: any, context: WorkflowContext) => {
    // Implementation for updating a record
    console.log('Executing update step:', step, 'with context:', context);
    
    if (!step.table || !step.recordId) {
      console.error('Missing table or record ID for update step');
      return false;
    }
    
    let recordId = replaceTokens(step.recordId, context.formData);
    if (!recordId) {
      console.error('Invalid record ID after token replacement');
      return false;
    }
    
    try {
      // Prepare update data by replacing tokens in values
      const updateData: Record<string, any> = {};
      
      if (step.fields && typeof step.fields === 'object') {
        Object.entries(step.fields).forEach(([key, value]) => {
          if (typeof value === 'string') {
            updateData[key] = replaceTokens(value, context.formData);
          } else {
            updateData[key] = value;
          }
        });
      }
      
      await supabase
        .from(step.table)
        .update(updateData)
        .eq('id', recordId);
        
      return true;
    } catch (error) {
      console.error(`Error updating record in ${step.table}:`, error);
      return false;
    }
  };

  const executeCreateStep = async (step: any, context: WorkflowContext) => {
    // Implementation for creating a record
    console.log('Executing create step:', step, 'with context:', context);
    
    if (!step.table) {
      console.error('Missing table for create step');
      return false;
    }
    
    try {
      // Prepare insert data by replacing tokens in values
      const insertData: Record<string, any> = {};
      
      if (step.fields && typeof step.fields === 'object') {
        Object.entries(step.fields).forEach(([key, value]) => {
          if (typeof value === 'string') {
            insertData[key] = replaceTokens(value, context.formData);
          } else {
            insertData[key] = value;
          }
        });
      }
      
      // Add default fields that might be useful
      if (context.userId && !insertData.user_id) {
        insertData.user_id = context.userId;
      }
      
      if (context.associationId && !insertData.association_id) {
        insertData.association_id = context.associationId;
      }
      
      await supabase
        .from(step.table)
        .insert(insertData);
        
      return true;
    } catch (error) {
      console.error(`Error creating record in ${step.table}:`, error);
      return false;
    }
  };

  // Helper to replace tokens like {{field_name}} with actual values
  const replaceTokens = (text: string, data: Record<string, any>): string => {
    if (!text || typeof text !== 'string') return text;
    
    return text.replace(/\{\{([^}]+)\}\}/g, (match, token) => {
      const value = data[token.trim()];
      return value !== undefined ? value : match;
    });
  };

  return {
    executeWorkflow,
    isExecuting
  };
}
