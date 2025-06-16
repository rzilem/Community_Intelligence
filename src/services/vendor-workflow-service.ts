
import { supabase } from '@/integrations/supabase/client';
import { VendorWorkflowAutomation, VendorWorkflowExecution, WorkflowTriggerData } from '@/types/vendor-advanced-types';

export const vendorWorkflowService = {
  async getWorkflowAutomations(associationId: string): Promise<VendorWorkflowAutomation[]> {
    const { data, error } = await supabase
      .from('vendor_workflow_automations')
      .select('*')
      .eq('association_id', associationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as VendorWorkflowAutomation[];
  },

  async createWorkflowAutomation(workflow: Omit<VendorWorkflowAutomation, 'id' | 'created_at' | 'updated_at'>): Promise<VendorWorkflowAutomation> {
    const { data, error } = await supabase
      .from('vendor_workflow_automations')
      .insert(workflow)
      .select()
      .single();

    if (error) throw error;
    return data as VendorWorkflowAutomation;
  },

  async updateWorkflowAutomation(id: string, updates: Partial<Omit<VendorWorkflowAutomation, 'id' | 'created_at' | 'updated_at'>>): Promise<VendorWorkflowAutomation> {
    const { data, error } = await supabase
      .from('vendor_workflow_automations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as VendorWorkflowAutomation;
  },

  async deleteWorkflowAutomation(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendor_workflow_automations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getWorkflowExecutions(workflowId: string): Promise<VendorWorkflowExecution[]> {
    const { data, error } = await supabase
      .from('vendor_workflow_executions')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as VendorWorkflowExecution[];
  },

  async executeWorkflow(workflowId: string, triggerData: WorkflowTriggerData): Promise<VendorWorkflowExecution> {
    const { data: workflow, error: workflowError } = await supabase
      .from('vendor_workflow_automations')
      .select('*')
      .eq('id', workflowId)
      .eq('is_active', true)
      .single();

    if (workflowError) throw workflowError;
    if (!workflow) throw new Error('Workflow not found or inactive');

    // Create execution record
    const { data, error } = await supabase
      .from('vendor_workflow_executions')
      .insert({
        workflow_id: workflowId,
        vendor_id: triggerData.vendor_id,
        trigger_data: triggerData,
        execution_status: 'pending' as const
      })
      .select()
      .single();

    if (error) throw error;

    // Process workflow actions (this would be expanded with actual action processing)
    await this.processWorkflowActions(data.id, workflow.actions);

    return data as VendorWorkflowExecution;
  },

  async processWorkflowActions(executionId: string, actions: Array<{ type: string; config: Record<string, any> }>): Promise<void> {
    // Update execution status to running
    await supabase
      .from('vendor_workflow_executions')
      .update({ execution_status: 'running' as const })
      .eq('id', executionId);

    try {
      // Process each action
      for (const action of actions) {
        switch (action.type) {
          case 'send_notification':
            await this.sendNotificationAction(action.config);
            break;
          case 'create_maintenance_request':
            await this.createMaintenanceRequestAction(action.config);
            break;
          case 'update_vendor_status':
            await this.updateVendorStatusAction(action.config);
            break;
          default:
            console.warn(`Unknown action type: ${action.type}`);
        }
      }

      // Mark as completed
      await supabase
        .from('vendor_workflow_executions')
        .update({ 
          execution_status: 'completed' as const,
          completed_at: new Date().toISOString()
        })
        .eq('id', executionId);

    } catch (error) {
      // Mark as failed
      await supabase
        .from('vendor_workflow_executions')
        .update({ 
          execution_status: 'failed' as const,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString()
        })
        .eq('id', executionId);
      
      throw error;
    }
  },

  private async sendNotificationAction(config: Record<string, any>): Promise<void> {
    // Implementation for sending notifications
    console.log('Sending notification:', config);
  },

  private async createMaintenanceRequestAction(config: Record<string, any>): Promise<void> {
    // Implementation for creating maintenance requests
    console.log('Creating maintenance request:', config);
  },

  private async updateVendorStatusAction(config: Record<string, any>): Promise<void> {
    // Implementation for updating vendor status
    console.log('Updating vendor status:', config);
  }
};
