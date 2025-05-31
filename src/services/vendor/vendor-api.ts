
import { supabase } from "@/integrations/supabase/client";
import { VendorServiceType, VendorStats, VendorFormData } from './vendor-types';
import { transformVendorRecord } from './vendor-utils';

export const vendorApi = {
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

    return (data || []).map(transformVendorRecord);
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

    return transformVendorRecord(data);
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

    return transformVendorRecord(data);
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

    return transformVendorRecord(data);
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
  }
};
