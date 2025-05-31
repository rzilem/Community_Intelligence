
// Vendor service types - centralized type definitions
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
  insurance_info?: Record<string, any> | null;
  insuranceInfo?: Record<string, any> | null; // Dual support for camelCase
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
