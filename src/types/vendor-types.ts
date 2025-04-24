
export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  category?: string;
  service_type?: string;
  status: 'active' | 'inactive';
  lastInvoice?: string;
  rating?: number;
  hasInsurance?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VendorFormData {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  category?: string;
  service_type?: string;
  status: 'active' | 'inactive';
  hasInsurance?: boolean;
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
  | 'Garbage'
  | 'Gas Reimbursement'
  | 'General Maintenance'
  | 'Heating and Air'
  | 'Homeowner'
  | 'Insurance'
  | 'Internet'
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
  'Garbage',
  'Gas Reimbursement',
  'General Maintenance',
  'Heating and Air',
  'Homeowner',
  'Insurance',
  'Internet',
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
