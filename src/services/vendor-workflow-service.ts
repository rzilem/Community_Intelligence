import { supabase } from '@/integrations/supabase/client';

export interface VendorWorkflowAutomation {
  id: string;
  association_id: string;
  name: string;
  trigger_type: string;
  trigger_conditions: any;
  action_type: string;
  action_config: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorWorkflowExecution {
  id: string;
  automation_id: string;
  vendor_id: string;
  status: string;
  execution_data: any;
  created_at: string;
}

export interface WorkflowTriggerData {
  vendor_id: string;
  association_id: string;
  [key: string]: any;
}

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

  async triggerWorkflowEvent(eventType: string, eventData: WorkflowTriggerData): Promise<void> {
    console.log('Triggering workflow event:', eventType, eventData);
    // Implementation would go here
  }
};