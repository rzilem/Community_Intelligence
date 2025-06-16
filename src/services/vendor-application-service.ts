
import { supabase } from '@/integrations/supabase/client';
import { VendorApplication } from '@/types/contract-types';

export const vendorApplicationService = {
  async getApplications(associationId: string): Promise<VendorApplication[]> {
    const { data, error } = await supabase
      .from('vendor_applications')
      .select('*')
      .eq('association_id', associationId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createApplication(application: Partial<VendorApplication>): Promise<VendorApplication> {
    const { data, error } = await supabase
      .from('vendor_applications')
      .insert(application)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateApplication(id: string, updates: Partial<VendorApplication>): Promise<VendorApplication> {
    const { data, error } = await supabase
      .from('vendor_applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async approveApplication(id: string, reviewerId: string): Promise<VendorApplication> {
    const { data, error } = await supabase
      .from('vendor_applications')
      .update({
        application_status: 'approved',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async rejectApplication(id: string, reviewerId: string, notes?: string): Promise<VendorApplication> {
    const { data, error } = await supabase
      .from('vendor_applications')
      .update({
        application_status: 'rejected',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        notes: notes
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
