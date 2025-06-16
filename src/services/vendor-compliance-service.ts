
import { supabase } from '@/integrations/supabase/client';
import { VendorComplianceItem } from '@/types/contract-types';

export const vendorComplianceService = {
  async getVendorCompliance(vendorId: string): Promise<VendorComplianceItem[]> {
    const { data, error } = await supabase
      .from('vendor_compliance_items')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('compliance_type');

    if (error) throw error;
    return data || [];
  },

  async createComplianceItem(item: Partial<VendorComplianceItem>): Promise<VendorComplianceItem> {
    const { data, error } = await supabase
      .from('vendor_compliance_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateComplianceItem(id: string, updates: Partial<VendorComplianceItem>): Promise<VendorComplianceItem> {
    const { data, error } = await supabase
      .from('vendor_compliance_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
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
    return data || [];
  }
};
