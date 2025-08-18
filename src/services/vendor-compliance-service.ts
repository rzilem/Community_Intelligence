
import { supabase } from '@/integrations/supabase/client';
import { VendorComplianceItem } from '@/types/contract-types';
import { workflowEventEmitter } from '@/services/ai-workflow/workflow-event-emitter';

export const vendorComplianceService = {
  async getVendorCompliance(vendorId: string): Promise<VendorComplianceItem[]> {
    const { data, error } = await supabase
      .from('vendor_compliance_items')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('compliance_type');

    if (error) throw error;
    return (data || []) as VendorComplianceItem[];
  },

  async createComplianceItem(item: Omit<VendorComplianceItem, 'id' | 'created_at' | 'updated_at'>): Promise<VendorComplianceItem> {
    const { data, error } = await supabase
      .from('vendor_compliance_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    
    // Emit workflow event for compliance item creation
    try {
      await workflowEventEmitter.emit('compliance_item_created', {
        compliance_item: data,
        vendor_id: data.vendor_id,
        compliance_type: data.compliance_type,
        status: data.status,
        expiry_date: data.expiry_date
      }, item.association_id);
    } catch (eventError) {
      console.warn('Failed to emit compliance item created event:', eventError);
    }
    
    return data as VendorComplianceItem;
  },

  async updateComplianceItem(id: string, updates: Partial<Omit<VendorComplianceItem, 'id' | 'created_at' | 'updated_at'>>): Promise<VendorComplianceItem> {
    const { data, error } = await supabase
      .from('vendor_compliance_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Emit workflow event for compliance item update
    try {
      const eventType = data.status === 'expired' ? 'compliance_item_expired' : 'compliance_item_updated';
      await workflowEventEmitter.emit(eventType, {
        compliance_item: data,
        vendor_id: data.vendor_id,
        compliance_type: data.compliance_type,
        previous_status: updates.status ? 'updated' : data.status,
        new_status: data.status,
        expiry_date: data.expiry_date
      }, data.association_id);
    } catch (eventError) {
      console.warn('Failed to emit compliance item updated event:', eventError);
    }
    
    return data as VendorComplianceItem;
  },

  async deleteComplianceItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendor_compliance_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getExpiringItems(associationId: string, days: number = 30): Promise<VendorComplianceItem[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    const { data, error } = await supabase
      .from('vendor_compliance_items')
      .select('*, vendors(name)')
      .eq('association_id', associationId)
      .not('expiry_date', 'is', null)
      .lte('expiry_date', futureDate.toISOString().split('T')[0])
      .eq('status', 'approved');

    if (error) throw error;
    return (data || []) as VendorComplianceItem[];
  }
};
