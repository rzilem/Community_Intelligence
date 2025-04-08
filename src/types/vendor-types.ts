
export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  category?: string;
  status: 'active' | 'inactive';
  lastInvoice?: string;
  rating?: number;
  hasInsurance?: boolean;
}

export interface VendorFormData {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  category?: string;
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
