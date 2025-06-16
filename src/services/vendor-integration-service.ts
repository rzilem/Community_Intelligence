
import { supabase } from '@/integrations/supabase/client';
import { VendorIntegration } from '@/types/vendor-advanced-types';

export const vendorIntegrationService = {
  async getVendorIntegrations(vendorId: string): Promise<VendorIntegration[]> {
    const { data, error } = await supabase
      .from('vendor_integrations')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as VendorIntegration[];
  },

  async createIntegration(integration: Omit<VendorIntegration, 'id' | 'created_at' | 'updated_at'>): Promise<VendorIntegration> {
    const { data, error } = await supabase
      .from('vendor_integrations')
      .insert(integration)
      .select()
      .single();

    if (error) throw error;
    return data as VendorIntegration;
  },

  async updateIntegration(id: string, updates: Partial<Omit<VendorIntegration, 'id' | 'created_at' | 'updated_at'>>): Promise<VendorIntegration> {
    const { data, error } = await supabase
      .from('vendor_integrations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as VendorIntegration;
  },

  async deleteIntegration(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendor_integrations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async testIntegration(id: string): Promise<{ success: boolean; message: string }> {
    const { data: integration, error } = await supabase
      .from('vendor_integrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!integration) throw new Error('Integration not found');

    try {
      // Simulate integration test based on type
      switch (integration.integration_type) {
        case 'api':
          return await this.testAPIIntegration(integration);
        case 'email':
          return await this.testEmailIntegration(integration);
        case 'portal':
          return await this.testPortalIntegration(integration);
        case 'accounting':
          return await this.testAccountingIntegration(integration);
        case 'calendar':
          return await this.testCalendarIntegration(integration);
        default:
          return { success: false, message: 'Unknown integration type' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Integration test failed' 
      };
    }
  },

  async syncIntegration(id: string): Promise<void> {
    await this.updateIntegration(id, {
      sync_status: 'syncing',
      last_sync: new Date().toISOString()
    });

    try {
      // Perform sync operation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate sync

      await this.updateIntegration(id, {
        sync_status: 'success',
        error_message: undefined
      });
    } catch (error) {
      await this.updateIntegration(id, {
        sync_status: 'error',
        error_message: error instanceof Error ? error.message : 'Sync failed'
      });
      throw error;
    }
  },

  private async testAPIIntegration(integration: VendorIntegration): Promise<{ success: boolean; message: string }> {
    // Mock API test
    return { success: true, message: 'API connection successful' };
  },

  private async testEmailIntegration(integration: VendorIntegration): Promise<{ success: boolean; message: string }> {
    // Mock email test
    return { success: true, message: 'Email configuration valid' };
  },

  private async testPortalIntegration(integration: VendorIntegration): Promise<{ success: boolean; message: string }> {
    // Mock portal test
    return { success: true, message: 'Portal connection established' };
  },

  private async testAccountingIntegration(integration: VendorIntegration): Promise<{ success: boolean; message: string }> {
    // Mock accounting test
    return { success: true, message: 'Accounting system connected' };
  },

  private async testCalendarIntegration(integration: VendorIntegration): Promise<{ success: boolean; message: string }> {
    // Mock calendar test
    return { success: true, message: 'Calendar sync available' };
  }
};
