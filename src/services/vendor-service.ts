
import { supabase } from '@/integrations/supabase/client';
import { Vendor, VendorStats } from "@/types/vendor-types";

export const vendorService = {
  getVendors: async (
    search?: string,
    category?: string,
    status?: string,
    sortBy?: { column: string; ascending: boolean }
  ): Promise<Vendor[]> => {
    let query = supabase
      .from('vendors')
      .select('*');

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('service_type', category);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (sortBy) {
      query = query.order(sortBy.column, { ascending: sortBy.ascending });
    } else {
      query = query.order('name', { ascending: true });
    }

    const { data: vendors, error } = await query;

    if (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }

    // Ensure all required properties are present
    return (vendors || []).map(vendor => ({
      ...vendor,
      status: vendor.status || 'active',
      hasInsurance: vendor.has_insurance || false,
      category: vendor.service_type,
      lastInvoice: undefined, // Add this if needed
    } as Vendor)) as Vendor[];
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

    return {
      ...vendor,
      status: vendor.status || 'active',
      hasInsurance: vendor.has_insurance || false,
      category: vendor.service_type,
      lastInvoice: undefined, // Add this if needed
    } as Vendor;
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
      withInsurance: vendors?.filter(v => v.has_insurance)?.length || 0
    };
  }
};
