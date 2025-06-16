
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
    return (data || []) as VendorApplication[];
  },

  async createApplication(application: Omit<VendorApplication, 'id' | 'created_at' | 'updated_at' | 'submitted_at'>): Promise<VendorApplication> {
    const { data, error } = await supabase
      .from('vendor_applications')
      .insert(application)
      .select()
      .single();

    if (error) throw error;
    return data as VendorApplication;
  },

  async updateApplication(id: string, updates: Partial<VendorApplication>): Promise<VendorApplication> {
    const { data, error } = await supabase
      .from('vendor_applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as VendorApplication;
  },

  async approveApplication(id: string, reviewerId: string): Promise<VendorApplication> {
    const { data, error } = await supabase
      .from('vendor_applications')
      .update({
        application_status: 'approved' as const,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as VendorApplication;
  },

  async rejectApplication(id: string, reviewerId: string, notes?: string): Promise<VendorApplication> {
    const { data, error } = await supabase
      .from('vendor_applications')
      .update({
        application_status: 'rejected' as const,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        notes: notes
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as VendorApplication;
  }
};
