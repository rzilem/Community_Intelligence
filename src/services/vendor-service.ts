
import { supabase } from "@/integrations/supabase/client";

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

// Create a type that matches what we send to the database for creation
interface VendorInsert {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  license_number?: string;
  insurance_info?: any;
  specialties: string[];
  rating?: number;
  total_jobs?: number;
  completed_jobs?: number;
  average_response_time?: number;
  is_active: boolean;
  notes?: string;
  hoa_id: string;
}

// Create a type that matches what we send to the database for updates
interface VendorUpdate {
  name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  license_number?: string;
  insurance_info?: any;
  specialties?: string[];
  rating?: number;
  total_jobs?: number;
  completed_jobs?: number;
  average_response_time?: number;
  is_active?: boolean;
  notes?: string;
  hoa_id?: string;
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

  createVendor: async (vendorData: VendorInsert): Promise<Vendor> => {
    // Ensure required fields are set with defaults
    const insertData: VendorInsert = {
      ...vendorData,
      total_jobs: vendorData.total_jobs || 0,
      completed_jobs: vendorData.completed_jobs || 0,
      is_active: vendorData.is_active ?? true,
      specialties: vendorData.specialties || []
    };

    const { data, error } = await supabase
      .from('vendors')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }

    return data;
  },

  updateVendor: async (id: string, vendorData: VendorUpdate): Promise<Vendor> => {
    console.log('Updating vendor with data:', vendorData);
    
    // Clean the update data to only include fields that exist in the database
    const cleanUpdateData: VendorUpdate = {};
    
    // Only include fields that are not undefined
    if (vendorData.name !== undefined) cleanUpdateData.name = vendorData.name;
    if (vendorData.contact_person !== undefined) cleanUpdateData.contact_person = vendorData.contact_person;
    if (vendorData.email !== undefined) cleanUpdateData.email = vendorData.email;
    if (vendorData.phone !== undefined) cleanUpdateData.phone = vendorData.phone;
    if (vendorData.address !== undefined) cleanUpdateData.address = vendorData.address;
    if (vendorData.license_number !== undefined) cleanUpdateData.license_number = vendorData.license_number;
    if (vendorData.insurance_info !== undefined) cleanUpdateData.insurance_info = vendorData.insurance_info;
    if (vendorData.specialties !== undefined) cleanUpdateData.specialties = vendorData.specialties;
    if (vendorData.rating !== undefined) cleanUpdateData.rating = vendorData.rating;
    if (vendorData.total_jobs !== undefined) cleanUpdateData.total_jobs = vendorData.total_jobs;
    if (vendorData.completed_jobs !== undefined) cleanUpdateData.completed_jobs = vendorData.completed_jobs;
    if (vendorData.average_response_time !== undefined) cleanUpdateData.average_response_time = vendorData.average_response_time;
    if (vendorData.is_active !== undefined) cleanUpdateData.is_active = vendorData.is_active;
    if (vendorData.notes !== undefined) cleanUpdateData.notes = vendorData.notes;
    if (vendorData.hoa_id !== undefined) cleanUpdateData.hoa_id = vendorData.hoa_id;

    const { data, error } = await supabase
      .from('vendors')
      .update(cleanUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }

    console.log('Vendor updated successfully:', data);
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
