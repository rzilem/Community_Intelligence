
import { supabase } from "@/integrations/supabase/client";
import { Vendor, VendorStats, VendorStatus, InsuranceInfo, VendorCategory } from "@/types/vendor-types";
import { workflowEventEmitter } from '@/services/ai-workflow/workflow-event-emitter';

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
  status: string;
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
  status?: string;
  is_active?: boolean;
  notes?: string;
  hoa_id?: string;
}

// Helper function to transform database vendor to typed Vendor
const transformDatabaseVendor = (dbVendor: any): Vendor => {
  return {
    ...dbVendor,
    // Map database columns to app expected columns
    hoa_id: dbVendor.association_id || dbVendor.hoa_id,
    contact_person: dbVendor.contact_name || dbVendor.contact_person,
    specialties: dbVendor.specialties || [],
    license_number: dbVendor.license_number || '',
    insurance_info: dbVendor.insurance_info as InsuranceInfo | undefined,
    status: dbVendor.status as VendorStatus
  };
};

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

    return (data || []).map(transformDatabaseVendor);
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

    return data ? transformDatabaseVendor(data) : undefined;
  },

  getVendorStats: async (): Promise<VendorStats> => {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*');

    if (error) {
      console.error('Error fetching vendor stats:', error);
      throw error;
    }

    const transformedVendors = (vendors || []).map(transformDatabaseVendor);
    const totalVendors = transformedVendors.length;
    const activeVendors = transformedVendors.filter(v => v.is_active).length;
    const inactiveVendors = totalVendors - activeVendors;
    
    // Calculate top category from specialties
    const categoryCount: Record<string, number> = {};
    transformedVendors.forEach(vendor => {
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
    const withInsurance = transformedVendors.filter(v => v.insurance_info && Object.keys(v.insurance_info).length > 0).length;

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
      status: vendorData.status || 'active',
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

    // Emit workflow event for vendor creation
    try {
      const associationId = data.association_id;
      if (associationId) {
        await workflowEventEmitter.emit('vendor_created', {
          vendor: data,
          vendor_name: data.name,
          specialties: [],
          contact_info: {
            email: data.email,
            phone: data.phone,
            contact_person: data.contact_name
          },
          license_number: '',
          insurance_info: {}
        }, associationId);
      }
    } catch (eventError) {
      console.warn('Failed to emit vendor created event:', eventError);
    }

    return transformDatabaseVendor(data);
  },

  updateVendor: async (id: string, vendorData: VendorUpdate): Promise<Vendor> => {
    console.log('Updating vendor with data:', vendorData);
    
    // Clean the update data to only include fields that are not undefined
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
    if (vendorData.status !== undefined) cleanUpdateData.status = vendorData.status;
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

    // Emit workflow event for vendor update
    try {
      const associationId = data.association_id;
      if (associationId) {
        let eventType = 'vendor_updated';
        if (vendorData.status === 'suspended') {
          eventType = 'vendor_suspended';
        } else if (vendorData.is_active === false) {
          eventType = 'vendor_deactivated';
        } else if (vendorData.is_active === true && cleanUpdateData.is_active !== undefined) {
          eventType = 'vendor_activated';
        }
        
        await workflowEventEmitter.emit(eventType, {
          vendor: data,
          vendor_id: id,
          updated_fields: Object.keys(cleanUpdateData),
          previous_status: vendorData.status ? 'updated' : data.status,
          new_status: data.status,
          specialties: data.specialties
        }, associationId);
      }
    } catch (eventError) {
      console.warn('Failed to emit vendor updated event:', eventError);
    }

    console.log('Vendor updated successfully:', data);
    return transformDatabaseVendor(data);
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
  },

  bulkAddSpecialties: async (vendorIds: string[], specialtiesToAdd: VendorCategory[]): Promise<Vendor[]> => {
    console.log('Bulk adding specialties to vendors:', { vendorIds, specialtiesToAdd });
    
    if (vendorIds.length === 0 || specialtiesToAdd.length === 0) {
      throw new Error('No vendors or specialties provided');
    }

    // First, get current vendors to merge specialties
    const { data: currentVendors, error: fetchError } = await supabase
      .from('vendors')
      .select('id, specialties')
      .in('id', vendorIds);

    if (fetchError) {
      console.error('Error fetching current vendors:', fetchError);
      throw fetchError;
    }

    // Update each vendor individually
    const updatePromises = currentVendors.map(async (vendor) => {
      const currentSpecialties = vendor.specialties || [];
      const mergedSpecialties = Array.from(new Set([...currentSpecialties, ...specialtiesToAdd]));
      
      const { data, error } = await supabase
        .from('vendors')
        .update({ specialties: mergedSpecialties })
        .eq('id', vendor.id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating vendor ${vendor.id}:`, error);
        throw error;
      }

      return transformDatabaseVendor(data);
    });

    try {
      const updatedVendors = await Promise.all(updatePromises);
      console.log('Bulk specialty update successful:', updatedVendors);
      return updatedVendors;
    } catch (error) {
      console.error('Error in bulk update:', error);
      throw error;
    }
  }
};
