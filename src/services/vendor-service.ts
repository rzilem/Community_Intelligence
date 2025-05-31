
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

    return (data || []).map(vendor => ({
      id: vendor.id,
      name: vendor.name,
      contactPerson: vendor.contact_person,
      email: vendor.email,
      phone: vendor.phone,
      category: vendor.category,
      status: (vendor.status || 'active') as 'active' | 'inactive',
      hasInsurance: vendor.has_insurance,
      rating: vendor.rating,
      lastInvoice: vendor.last_invoice
    }));
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

    return {
      id: data.id,
      name: data.name,
      contactPerson: data.contact_person,
      email: data.email,
      phone: data.phone,
      category: data.category,
      status: (data.status || 'active') as 'active' | 'inactive',
      hasInsurance: data.has_insurance,
      rating: data.rating,
      lastInvoice: data.last_invoice
    };
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
    const dbVendor = {
      name: vendorData.name,
      contact_person: vendorData.contactPerson,
      email: vendorData.email,
      phone: vendorData.phone,
      category: vendorData.category,
      status: vendorData.status,
      has_insurance: vendorData.hasInsurance,
      rating: vendorData.rating,
      last_invoice: vendorData.lastInvoice,
      total_jobs: 0,
      completed_jobs: 0,
      is_active: true
    };

    const { data, error } = await supabase
      .from('vendors')
      .insert([dbVendor])
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor:', error);
      throw new Error('Failed to create vendor');
    }

    return {
      id: data.id,
      name: data.name,
      contactPerson: data.contact_person,
      email: data.email,
      phone: data.phone,
      category: data.category,
      status: (data.status || 'active') as 'active' | 'inactive',
      hasInsurance: data.has_insurance,
      rating: data.rating,
      lastInvoice: data.last_invoice
    };
  },

  updateVendor: async (id: string, vendorData: Partial<Vendor>): Promise<Vendor> => {
    const dbUpdates: any = {};
    
    if (vendorData.name !== undefined) dbUpdates.name = vendorData.name;
    if (vendorData.contactPerson !== undefined) dbUpdates.contact_person = vendorData.contactPerson;
    if (vendorData.email !== undefined) dbUpdates.email = vendorData.email;
    if (vendorData.phone !== undefined) dbUpdates.phone = vendorData.phone;
    if (vendorData.category !== undefined) dbUpdates.category = vendorData.category;
    if (vendorData.status !== undefined) dbUpdates.status = vendorData.status;
    if (vendorData.hasInsurance !== undefined) dbUpdates.has_insurance = vendorData.hasInsurance;
    if (vendorData.rating !== undefined) dbUpdates.rating = vendorData.rating;
    if (vendorData.lastInvoice !== undefined) dbUpdates.last_invoice = vendorData.lastInvoice;

    const { data, error } = await supabase
      .from('vendors')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vendor:', error);
      throw new Error('Failed to update vendor');
    }

    return {
      id: data.id,
      name: data.name,
      contactPerson: data.contact_person,
      email: data.email,
      phone: data.phone,
      category: data.category,
      status: (data.status || 'active') as 'active' | 'inactive',
      hasInsurance: data.has_insurance,
      rating: data.rating,
      lastInvoice: data.last_invoice
    };
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
