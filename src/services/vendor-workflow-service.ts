
import { supabase } from '@/integrations/supabase/client';
import { VendorWorkflowAutomation, VendorWorkflowExecution, WorkflowTriggerData } from '@/types/vendor-advanced-types';

export const vendorWorkflowService = {
  async getWorkflowAutomations(associationId: string): Promise<VendorWorkflowAutomation[]> {
    const { data, error } = await supabase
      .from('vendor_workflow_automations')
      .select('*')
      .eq('association_id', associationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workflow automations:', error);
      throw error;
    }

    return data || [];
  },

  async createWorkflowAutomation(workflow: Omit<VendorWorkflowAutomation, 'id' | 'created_at' | 'updated_at'>): Promise<VendorWorkflowAutomation> {
    const { data, error } = await supabase
      .from('vendor_workflow_automations')
      .insert(workflow)
      .select()
      .single();

    if (error) {
      console.error('Error creating workflow automation:', error);
      throw error;
    }

    return data;
  },

  async updateWorkflowAutomation(id: string, updates: Partial<Omit<VendorWorkflowAutomation, 'id' | 'created_at' | 'updated_at'>>): Promise<VendorWorkflowAutomation> {
    const { data, error } = await supabase
      .from('vendor_workflow_automations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating workflow automation:', error);
      throw error;
    }

    return data;
  },

  async deleteWorkflowAutomation(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendor_workflow_automations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting workflow automation:', error);
      throw error;
    }
  },

  async getWorkflowExecutions(workflowId: string): Promise<VendorWorkflowExecution[]> {
    const { data, error } = await supabase
      .from('vendor_workflow_executions')
      .select(`
        *,
        vendor_workflow_action_logs (*)
      `)
      .eq('automation_id', workflowId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workflow executions:', error);
      throw error;
    }

    return data || [];
  },

  async executeWorkflow(workflowId: string, triggerData: WorkflowTriggerData): Promise<VendorWorkflowExecution> {
    // Call the workflow automation executor edge function
    const { data, error } = await supabase.functions.invoke('workflow-automation-executor', {
      body: {
        event: {
          type: 'manual',
          vendor_id: triggerData.vendor_id,
          association_id: triggerData.association_id,
          data: triggerData
        }
      }
    });

    if (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }

    // Get the latest execution for this workflow
    const { data: executions } = await supabase
      .from('vendor_workflow_executions')
      .select('*')
      .eq('automation_id', workflowId)
      .order('created_at', { ascending: false })
      .limit(1);

    return executions?.[0] || data;
  },

  async triggerWorkflowEvent(eventType: string, eventData: WorkflowTriggerData): Promise<void> {
    // Call the workflow automation executor edge function
    const { error } = await supabase.functions.invoke('workflow-automation-executor', {
      body: {
        event: {
          type: eventType,
          vendor_id: eventData.vendor_id,
          association_id: eventData.association_id,
          data: eventData
        }
      }
    });

    if (error) {
      console.error('Error triggering workflow event:', error);
      throw error;
    }
  },

  async getWorkflowActionLogs(executionId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('vendor_workflow_action_logs')
      .select('*')
      .eq('execution_id', executionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching workflow action logs:', error);
      throw error;
    }

    return data || [];
  }
};
