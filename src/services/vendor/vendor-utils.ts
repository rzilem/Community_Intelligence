
import { VendorServiceType } from './vendor-types';

// Type casting helper for status
export const parseVendorStatus = (status: string | null | undefined): 'active' | 'inactive' => {
  if (status === 'active' || status === 'inactive') {
    return status;
  }
  return 'active'; // default fallback
};

// Helper function to safely parse insurance info
export const parseInsuranceInfo = (insurance_info: any): Record<string, any> | null => {
  if (!insurance_info) return null;
  if (typeof insurance_info === 'object' && insurance_info !== null) {
    return insurance_info as Record<string, any>;
  }
  if (typeof insurance_info === 'string') {
    try {
      return JSON.parse(insurance_info);
    } catch {
      return null;
    }
  }
  return null;
};

// Transform database vendor record to VendorServiceType
export const transformVendorRecord = (vendor: any): VendorServiceType => {
  return {
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
    insurance_info: parseInsuranceInfo(vendor.insurance_info),
    insuranceInfo: parseInsuranceInfo(vendor.insurance_info),
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
  };
};
