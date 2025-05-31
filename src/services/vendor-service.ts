
import { supabase } from "@/integrations/supabase/client";
import { Vendor, VendorStats } from "@/types/vendor-types";

export const vendorService = {
  getVendors: async (): Promise<Vendor[]> => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching vendors:', error);
      throw new Error('Failed to fetch vendors');
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
      return undefined;
    }

    return data;
  },

  getVendorStats: async (): Promise<VendorStats> => {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*');

    if (error) {
      console.error('Error fetching vendor stats:', error);
      throw new Error('Failed to fetch vendor stats');
    }

    const totalVendors = vendors?.length || 0;
    const activeVendors = vendors?.filter(v => v.status === 'active').length || 0;
    const inactiveVendors = totalVendors - activeVendors;
    const withInsurance = vendors?.filter(v => v.has_insurance === true).length || 0;

    // Calculate most common category
    const categoryCount: Record<string, number> = {};
    vendors?.forEach(vendor => {
      if (vendor.category) {
        categoryCount[vendor.category] = (categoryCount[vendor.category] || 0) + 1;
      }
    });

    const topCategory = Object.keys(categoryCount).length > 0 
      ? Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b)
      : null;

    const serviceCategories = Object.keys(categoryCount).length;

    return {
      totalVendors,
      activeVendors,
      inactiveVendors,
      topCategory,
      serviceCategories,
      withInsurance
    };
  },

  createVendor: async (vendorData: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>): Promise<Vendor> => {
    const { data, error } = await supabase
      .from('vendors')
      .insert([vendorData])
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor:', error);
      throw new Error('Failed to create vendor');
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
      throw new Error('Failed to update vendor');
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
      throw new Error('Failed to delete vendor');
    }
  }
};
