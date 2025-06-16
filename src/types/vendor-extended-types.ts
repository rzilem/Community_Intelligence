
export interface VendorDocument {
  id: string;
  vendor_id: string;
  document_name: string;
  document_type: 'insurance' | 'license' | 'contract' | 'certification' | 'other';
  file_url: string;
  file_size?: number;
  expiry_date?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorCertification {
  id: string;
  vendor_id: string;
  certification_name: string;
  issuing_authority?: string;
  certification_number?: string;
  issue_date?: string;
  expiry_date?: string;
  status: 'active' | 'expired' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface VendorPerformanceMetrics {
  id: string;
  vendor_id: string;
  association_id: string;
  period_start: string;
  period_end: string;
  total_jobs: number;
  completed_jobs: number;
  cancelled_jobs: number;
  average_completion_days?: number;
  customer_satisfaction_score?: number;
  on_time_completion_rate?: number;
  budget_adherence_rate?: number;
  quality_score?: number;
  created_at: string;
  updated_at: string;
}

export interface VendorReview {
  id: string;
  vendor_id: string;
  reviewer_id: string;
  association_id: string;
  job_reference?: string;
  rating: number;
  review_text?: string;
  review_date: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  reviewer?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export interface VendorAvailability {
  id: string;
  vendor_id: string;
  day_of_week: number; // 0 = Sunday
  start_time?: string;
  end_time?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorEmergencyContact {
  id: string;
  vendor_id: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  relationship: 'primary' | 'secondary' | 'after_hours';
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// Base Vendor interface from the database
export interface BaseVendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contact_person?: string;
  license_number?: string;
  specialties?: string[];
  notes?: string;
  is_active: boolean;
  rating?: number;
  total_jobs: number;
  completed_jobs: number;
  average_response_time?: number;
  created_at: string;
  updated_at: string;
  hoa_id?: string;
  logo_url?: string; // Added logo_url field
}

export interface ExtendedVendor extends BaseVendor {
  insurance_expiry_date?: string;
  insurance_certificate_url?: string;
  bond_amount?: number;
  bond_expiry_date?: string;
  documents?: VendorDocument[];
  certifications?: VendorCertification[];
  performance_metrics?: VendorPerformanceMetrics[];
  reviews?: VendorReview[];
  availability?: VendorAvailability[];
  emergency_contacts?: VendorEmergencyContact[];
}

export interface VendorDocumentFormData {
  document_name: string;
  document_type: 'insurance' | 'license' | 'contract' | 'certification' | 'other';
  file_url: string;
  expiry_date?: string;
}

export interface VendorCertificationFormData {
  certification_name: string;
  issuing_authority?: string;
  certification_number?: string;
  issue_date?: string;
  expiry_date?: string;
  status: 'active' | 'expired' | 'suspended';
}

export interface VendorReviewFormData {
  rating: number;
  review_text?: string;
  job_reference?: string;
}

export interface VendorEmergencyContactFormData {
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  relationship: 'primary' | 'secondary' | 'after_hours';
  is_primary: boolean;
}
