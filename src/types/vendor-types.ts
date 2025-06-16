
export type VendorStatus = 'active' | 'on-hold' | 'inactive' | 'suspended';

export interface Vendor {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  license_number?: string;
  insurance_info?: InsuranceInfo;
  specialties: string[];
  rating?: number;
  total_jobs: number;
  completed_jobs: number;
  average_response_time?: number;
  /** Current status of the vendor record */
  status: VendorStatus;
  is_active: boolean;
  notes?: string;
  hoa_id: string;
  created_at: string;
  updated_at: string;
}

export interface InsuranceInfo {
  provider?: string;
  policy_number?: string;
  coverage_amount?: number;
  expiration_date?: string;
  certificate_url?: string;
}

export interface VendorFormData {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  license_number?: string;
  specialties: string[];
  insurance_info?: InsuranceInfo;
  notes?: string;
  is_active: boolean;
  status: VendorStatus;
  hoa_id: string;
}

export interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  inactiveVendors: number;
  topCategory: string | null;
  serviceCategories: number;
  withInsurance: number;
}

export type VendorCategory =
  | 'Access Systems'
  | 'Asphalt'
  | 'Attorney'
  | 'Board Member'
  | 'Call Box'
  | 'Carpet'
  | 'Checks'
  | 'Cleaning'
  | 'Collection Attorney'
  | 'Concrete'
  | 'Construction'
  | 'CPA'
  | 'Electrical Services'
  | 'Elevator'
  | 'Equipment Rental'
  | 'Exercise Equipment Maintenance'
  | 'Exterior Painting'
  | 'Fees and Permits'
  | 'Fence Maintenance'
  | 'Fire Services'
  | 'Foundation Repair'
  | 'Garbage'
  | 'Gas Reimbursement'
  | 'General Maintenance'
  | 'Heating and Air'
  | 'Homeowner'
  | 'Insurance'
  | 'Interior Painting'
  | 'Internet'
  | 'Irrigation'
  | 'Janitorial'
  | 'Landscape'
  | 'Landscaping Maintenance'
  | 'Lighting'
  | 'Mailing Services'
  | 'Management'
  | 'Masonry'
  | 'Master HOA Assessments'
  | 'Miscellaneous'
  | 'Mold'
  | 'Pest Control'
  | 'Phone'
  | 'Playground Equipment'
  | 'Plumbing'
  | 'Pool & Spa Services'
  | 'Pool Maintenance'
  | 'Postage'
  | 'Pressure Washing'
  | 'Printing'
  | 'Professional Services'
  | 'Property Taxes'
  | 'PS Community Association Client'
  | 'Repairs & Maintenance'
  | 'Roofing'
  | 'Security'
  | 'Security Surveillance Camera'
  | 'Stormwater'
  | 'Taxes'
  | 'Trash Removal'
  | 'Tree Service'
  | 'Utility'
  | 'Window Cleaning';

export const VENDOR_CATEGORIES: VendorCategory[] = [
  'Access Systems',
  'Asphalt',
  'Attorney',
  'Board Member',
  'Call Box',
  'Carpet',
  'Checks',
  'Cleaning',
  'Collection Attorney',
  'Concrete',
  'Construction',
  'CPA',
  'Electrical Services',
  'Elevator',
  'Equipment Rental',
  'Exercise Equipment Maintenance',
  'Exterior Painting',
  'Fees and Permits',
  'Fence Maintenance',
  'Fire Services',
  'Foundation Repair',
  'Garbage',
  'Gas Reimbursement',
  'General Maintenance',
  'Heating and Air',
  'Homeowner',
  'Insurance',
  'Interior Painting',
  'Internet',
  'Irrigation',
  'Janitorial',
  'Landscape',
  'Landscaping Maintenance',
  'Lighting',
  'Mailing Services',
  'Management',
  'Masonry',
  'Master HOA Assessments',
  'Miscellaneous',
  'Mold',
  'Pest Control',
  'Phone',
  'Playground Equipment',
  'Plumbing',
  'Pool & Spa Services',
  'Pool Maintenance',
  'Postage',
  'Pressure Washing',
  'Printing',
  'Professional Services',
  'Property Taxes',
  'PS Community Association Client',
  'Repairs & Maintenance',
  'Roofing',
  'Security',
  'Security Surveillance Camera',
  'Stormwater',
  'Taxes',
  'Trash Removal',
  'Tree Service',
  'Utility',
  'Window Cleaning'
];
