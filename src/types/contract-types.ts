
export interface VendorContractTemplate {
  id: string;
  association_id: string;
  template_name: string;
  template_type: 'service' | 'maintenance' | 'emergency' | 'annual' | 'custom';
  contract_terms: string;
  default_duration_months: number;
  auto_renew: boolean;
  requires_insurance: boolean;
  requires_license: boolean;
  template_content: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface VendorContract {
  id: string;
  vendor_id: string;
  association_id: string;
  template_id?: string;
  contract_number: string;
  contract_title: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  contract_value?: number;
  status: 'draft' | 'pending_approval' | 'active' | 'expired' | 'terminated' | 'renewed';
  contract_terms?: string;
  auto_renew: boolean;
  renewal_notice_days: number;
  payment_terms?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorContractAmendment {
  id: string;
  contract_id: string;
  amendment_number: number;
  amendment_type: 'extension' | 'rate_change' | 'scope_change' | 'termination' | 'other';
  description: string;
  effective_date: string;
  old_values?: any;
  new_values?: any;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface VendorApplication {
  id: string;
  association_id: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone?: string;
  business_address?: string;
  tax_id?: string;
  license_number?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_expiry_date?: string;
  bond_amount?: number;
  bond_expiry_date?: string;
  specialties?: string[];
  years_in_business?: number;
  business_references?: any;
  application_status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_info';
  qualification_score?: number;
  background_check_status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  background_check_date?: string;
  notes?: string;
  submitted_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorComplianceItem {
  id: string;
  vendor_id: string;
  association_id: string;
  compliance_type: 'insurance' | 'license' | 'certification' | 'background_check' | 'bond' | 'permit' | 'custom';
  item_name: string;
  description?: string;
  required: boolean;
  status: 'pending' | 'submitted' | 'approved' | 'expired' | 'rejected' | 'not_applicable';
  document_url?: string;
  issue_date?: string;
  expiry_date?: string;
  renewal_notice_days: number;
  last_reminder_sent?: string;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorCategory {
  id: string;
  association_id: string;
  category_name: string;
  description?: string;
  parent_category_id?: string;
  requires_license: boolean;
  requires_insurance: boolean;
  minimum_insurance_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface VendorServiceArea {
  id: string;
  vendor_id: string;
  area_name: string;
  area_type: 'city' | 'zip_code' | 'radius' | 'custom';
  area_value: string;
  is_primary_area: boolean;
  travel_fee: number;
  created_at: string;
}

export interface VendorCapability {
  id: string;
  vendor_id: string;
  category_id: string;
  proficiency_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  years_experience?: number;
  certifications?: string[];
  preferred_vendor: boolean;
  created_at: string;
  updated_at: string;
}
