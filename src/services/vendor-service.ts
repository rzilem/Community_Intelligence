
import { supabase } from '@/integrations/supabase/client';
import { Vendor, VendorStats } from "@/types/vendor-types";

export const vendorService = {
  getVendors: async (): Promise<Vendor[]> => {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }

    return vendors || [];
  },

  getVendorById: async (id: string): Promise<Vendor | undefined> => {
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching vendor:', error);
      return undefined;
    }

    return vendor;
  },

  getVendorStats: async (): Promise<VendorStats> => {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*');

    if (error) {
      console.error('Error fetching vendor stats:', error);
      throw error;
    }

    const activeVendors = vendors?.filter(v => v.status === 'active') || [];
    const inactiveVendors = vendors?.filter(v => v.status !== 'active') || [];
    const categories = [...new Set(vendors?.map(v => v.service_type) || [])];

    return {
      totalVendors: vendors?.length || 0,
      activeVendors: activeVendors.length,
      inactiveVendors: inactiveVendors.length,
      topCategory: categories[0] || null,
      serviceCategories: categories.length,
      withInsurance: vendors?.filter(v => v.hasInsurance)?.length || 0
    };
  }
};
