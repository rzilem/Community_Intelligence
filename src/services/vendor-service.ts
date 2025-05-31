
import { supabase } from "@/integrations/supabase/client";

// Define a unified Vendor interface for the vendor service that matches the database schema
export interface VendorServiceType {
  id: string;
  name: string;
  contactPerson?: string;
  contact_person?: string; // Dual support for snake_case
  email?: string;
  phone?: string;
  category?: string;
  status: 'active' | 'inactive';
  hasInsurance?: boolean;
  has_insurance?: boolean; // Dual support for snake_case
  rating?: number;
  lastInvoice?: string;
  last_invoice?: string; // Dual support for snake_case
  hoa_id?: string;
  hoaId?: string; // Dual support for camelCase
  specialties?: string[];
  total_jobs?: number;
  totalJobs?: number; // Dual support for camelCase
  completed_jobs?: number;
  completedJobs?: number; // Dual support for camelCase
  average_response_time?: number;
  averageResponseTime?: number; // Dual support for camelCase
  address?: string;
  service_type?: string;
  serviceType?: string; // Dual support for camelCase
  insurance_info?: Record<string, any>;
  insuranceInfo?: Record<string, any>; // Dual support for camelCase
  logo_url?: string;
  logoUrl?: string; // Dual support for camelCase
  license_number?: string;
  licenseNumber?: string; // Dual support for camelCase
  description?: string;
  is_active?: boolean;
  isActive?: boolean; // Dual support for camelCase
  notes?: string;
  created_at?: string;
  createdAt?: string; // Dual support for camelCase
  updated_at?: string;
  updatedAt?: string; // Dual support for camelCase
}

// Define vendor stats interface
export interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  inactiveVendors: number;
  topCategory: string | null;
  serviceCategories: number;
  withInsurance: number;
}

// Define form data interface
export interface VendorFormData {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  category?: string;
  status: 'active' | 'inactive';
  hasInsurance?: boolean;
  address?: string;
  serviceType?: string;
  specialties?: string[];
  licenseNumber?: string;
  description?: string;
  notes?: string;
}

// Type casting helper for status
const parseVendorStatus = (status: string | null | undefined): 'active' | 'inactive' => {
  if (status === 'active' || status === 'inactive') {
    return status;
  }
  return 'active'; // default fallback
};

export const vendorService = {
  getVendors: async (): Promise<VendorServiceType[]> => {
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
      contact_person: vendor.contact_person,
      email: vendor.email,
      phone: vendor.phone,
      category: vendor.category,
      status: parseVendorStatus(vendor.status),
      hasInsurance: vendor.has_insurance,
      has_insurance: vendor.has_insurance,
      rating: vendor.rating,
      lastInvoice: vendor.last_invoice,
      last_invoice: vendor.last_invoice,
      hoa_id: vendor.hoa_id,
      hoaId: vendor.hoa_id,
      specialties: vendor.specialties || [],
      total_jobs: vendor.total_jobs,
      totalJobs: vendor.total_jobs,
      completed_jobs: vendor.completed_jobs,
      completedJobs: vendor.completed_jobs,
      average_response_time: vendor.average_response_time,
      averageResponseTime: vendor.average_response_time,
      address: vendor.address,
      service_type: vendor.service_type,
      serviceType: vendor.service_type,
      insurance_info: vendor.insurance_info,
      insuranceInfo: vendor.insurance_info,
      logo_url: vendor.logo_url,
      logoUrl: vendor.logo_url,
      license_number: vendor.license_number,
      licenseNumber: vendor.license_number,
      description: vendor.description,
      is_active: vendor.is_active,
      isActive: vendor.is_active,
      notes: vendor.notes,
      created_at: vendor.created_at,
      createdAt: vendor.created_at,
      updated_at: vendor.updated_at,
      updatedAt: vendor.updated_at
    }));
  },

  getVendorById: async (id: string): Promise<VendorServiceType | undefined> => {
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
      contact_person: data.contact_person,
      email: data.email,
      phone: data.phone,
      category: data.category,
      status: parseVendorStatus(data.status),
      hasInsurance: data.has_insurance,
      has_insurance: data.has_insurance,
      rating: data.rating,
      lastInvoice: data.last_invoice,
      last_invoice: data.last_invoice,
      hoa_id: data.hoa_id,
      hoaId: data.hoa_id,
      specialties: data.specialties || [],
      total_jobs: data.total_jobs,
      totalJobs: data.total_jobs,
      completed_jobs: data.completed_jobs,
      completedJobs: data.completed_jobs,
      average_response_time: data.average_response_time,
      averageResponseTime: data.average_response_time,
      address: data.address,
      service_type: data.service_type,
      serviceType: data.service_type,
      insurance_info: data.insurance_info,
      insuranceInfo: data.insurance_info,
      logo_url: data.logo_url,
      logoUrl: data.logo_url,
      license_number: data.license_number,
      licenseNumber: data.license_number,
      description: data.description,
      is_active: data.is_active,
      isActive: data.is_active,
      notes: data.notes,
      created_at: data.created_at,
      createdAt: data.created_at,
      updated_at: data.updated_at,
      updatedAt: data.updated_at
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

  createVendor: async (vendorData: VendorFormData): Promise<VendorServiceType> => {
    const dbVendor = {
      name: vendorData.name,
      contact_person: vendorData.contactPerson,
      email: vendorData.email,
      phone: vendorData.phone,
      category: vendorData.category,
      status: vendorData.status,
      has_insurance: vendorData.hasInsurance,
      address: vendorData.address,
      service_type: vendorData.serviceType,
      specialties: vendorData.specialties || [],
      license_number: vendorData.licenseNumber,
      description: vendorData.description,
      notes: vendorData.notes,
      rating: null,
      last_invoice: null,
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
      contact_person: data.contact_person,
      email: data.email,
      phone: data.phone,
      category: data.category,
      status: parseVendorStatus(data.status),
      hasInsurance: data.has_insurance,
      has_insurance: data.has_insurance,
      rating: data.rating,
      lastInvoice: data.last_invoice,
      last_invoice: data.last_invoice,
      hoa_id: data.hoa_id,
      hoaId: data.hoa_id,
      specialties: data.specialties || [],
      total_jobs: data.total_jobs,
      totalJobs: data.total_jobs,
      completed_jobs: data.completed_jobs,
      completedJobs: data.completed_jobs,
      average_response_time: data.average_response_time,
      averageResponseTime: data.average_response_time,
      address: data.address,
      service_type: data.service_type,
      serviceType: data.service_type,
      insurance_info: data.insurance_info,
      insuranceInfo: data.insurance_info,
      logo_url: data.logo_url,
      logoUrl: data.logo_url,
      license_number: data.license_number,
      licenseNumber: data.license_number,
      description: data.description,
      is_active: data.is_active,
      isActive: data.is_active,
      notes: data.notes,
      created_at: data.created_at,
      createdAt: data.created_at,
      updated_at: data.updated_at,
      updatedAt: data.updated_at
    };
  },

  updateVendor: async (id: string, vendorData: Partial<VendorServiceType>): Promise<VendorServiceType> => {
    const dbUpdates: any = {};
    
    if (vendorData.name !== undefined) dbUpdates.name = vendorData.name;
    if (vendorData.contactPerson !== undefined) dbUpdates.contact_person = vendorData.contactPerson;
    if (vendorData.contact_person !== undefined) dbUpdates.contact_person = vendorData.contact_person;
    if (vendorData.email !== undefined) dbUpdates.email = vendorData.email;
    if (vendorData.phone !== undefined) dbUpdates.phone = vendorData.phone;
    if (vendorData.category !== undefined) dbUpdates.category = vendorData.category;
    if (vendorData.status !== undefined) dbUpdates.status = vendorData.status;
    if (vendorData.hasInsurance !== undefined) dbUpdates.has_insurance = vendorData.hasInsurance;
    if (vendorData.has_insurance !== undefined) dbUpdates.has_insurance = vendorData.has_insurance;
    if (vendorData.rating !== undefined) dbUpdates.rating = vendorData.rating;
    if (vendorData.lastInvoice !== undefined) dbUpdates.last_invoice = vendorData.lastInvoice;
    if (vendorData.last_invoice !== undefined) dbUpdates.last_invoice = vendorData.last_invoice;
    if (vendorData.specialties !== undefined) dbUpdates.specialties = vendorData.specialties;
    if (vendorData.address !== undefined) dbUpdates.address = vendorData.address;
    if (vendorData.serviceType !== undefined) dbUpdates.service_type = vendorData.serviceType;
    if (vendorData.service_type !== undefined) dbUpdates.service_type = vendorData.service_type;
    if (vendorData.licenseNumber !== undefined) dbUpdates.license_number = vendorData.licenseNumber;
    if (vendorData.license_number !== undefined) dbUpdates.license_number = vendorData.license_number;
    if (vendorData.description !== undefined) dbUpdates.description = vendorData.description;
    if (vendorData.notes !== undefined) dbUpdates.notes = vendorData.notes;

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
      contact_person: data.contact_person,
      email: data.email,
      phone: data.phone,
      category: data.category,
      status: parseVendorStatus(data.status),
      hasInsurance: data.has_insurance,
      has_insurance: data.has_insurance,
      rating: data.rating,
      lastInvoice: data.last_invoice,
      last_invoice: data.last_invoice,
      hoa_id: data.hoa_id,
      hoaId: data.hoa_id,
      specialties: data.specialties || [],
      total_jobs: data.total_jobs,
      totalJobs: data.total_jobs,
      completed_jobs: data.completed_jobs,
      completedJobs: data.completed_jobs,
      average_response_time: data.average_response_time,
      averageResponseTime: data.average_response_time,
      address: data.address,
      service_type: data.service_type,
      serviceType: data.service_type,
      insurance_info: data.insurance_info,
      insuranceInfo: data.insurance_info,
      logo_url: data.logo_url,
      logoUrl: data.logo_url,
      license_number: data.license_number,
      licenseNumber: data.license_number,
      description: data.description,
      is_active: data.is_active,
      isActive: data.is_active,
      notes: data.notes,
      created_at: data.created_at,
      createdAt: data.created_at,
      updated_at: data.updated_at,
      updatedAt: data.updated_at
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
