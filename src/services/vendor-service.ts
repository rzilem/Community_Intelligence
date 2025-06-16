
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

// Real vendor type based on database structure
export interface Vendor {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  license_number?: string;
  insurance_info?: any;
  specialties: string[];
  rating?: number;
  total_jobs: number;
  completed_jobs: number;
  average_response_time?: number;
  is_active: boolean;
  notes?: string;
  hoa_id: string;
  created_at: string;
  updated_at: string;
}

export interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  inactiveVendors: number;
  topCategory: string | null;
  serviceCategories: number;
  withInsurance: number;
}

export const vendorService = {
  getVendors: async (): Promise<Vendor[]> => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }

    return data || [];
  },

  getVendorById: async (id: string): Promise<Vendor | undefined> => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching vendor:', error);
      throw error;
    }

    return data;
  },

  getVendorStats: async (): Promise<VendorStats> => {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*');

    if (error) {
      console.error('Error fetching vendor stats:', error);
      throw error;
    }

    const totalVendors = vendors?.length || 0;
    const activeVendors = vendors?.filter(v => v.is_active).length || 0;
    const inactiveVendors = totalVendors - activeVendors;
    
    // Calculate top category from specialties
    const categoryCount: Record<string, number> = {};
    vendors?.forEach(vendor => {
      if (vendor.specialties && Array.isArray(vendor.specialties)) {
        vendor.specialties.forEach(specialty => {
          categoryCount[specialty] = (categoryCount[specialty] || 0) + 1;
        });
      }
    });
    
    const topCategory = Object.keys(categoryCount).length > 0 
      ? Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b)
      : null;

    const serviceCategories = Object.keys(categoryCount).length;
    const withInsurance = vendors?.filter(v => v.insurance_info && Object.keys(v.insurance_info).length > 0).length || 0;

    return {
      totalVendors,
      activeVendors,
      inactiveVendors,
      topCategory,
      serviceCategories,
      withInsurance
    };
  },

  createVendor: async (vendorData: Partial<Vendor>): Promise<Vendor> => {
    const { data, error } = await supabase
      .from('vendors')
      .insert(vendorData)
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }

    return data;
  },

  updateVendor: async (id: string, vendorData: Partial<Vendor>): Promise<Vendor> => {
    const { data, error } = await supabase
      .from('vendors')
      .update(vendorData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }

    return data;
  },

  deleteVendor: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  }
};
