// Community Intelligence Bid Request System - TypeScript Interfaces
// File: frontend/src/types/bidRequest.ts

export interface ProjectType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  conditional_fields: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BidRequest {
  id: string;
  hoa_id: string;
  maintenance_request_id?: string;
  title: string;
  description: string;
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget_range_min?: number;
  budget_range_max?: number;
  preferred_start_date?: string;
  required_completion_date?: string;
  location?: string;
  special_requirements?: string;
  attachments?: AttachmentFile[];
  status: 'draft' | 'published' | 'bidding' | 'evaluating' | 'awarded' | 'completed' | 'cancelled';
  bid_deadline?: string;
  selected_vendor_id?: string;
  awarded_amount?: number;
  awarded_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  hoa_id: string;
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
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorBid {
  id: string;
  bid_request_id: string;
  vendor_id: string;
  bid_amount: number;
  proposed_timeline?: number;
  timeline_start_date?: string;
  timeline_completion_date?: string;
  proposal_text?: string;
  attachments?: AttachmentFile[];
  warranty_terms?: string;
  payment_terms?: string;
  is_selected: boolean;
  evaluation_score?: number;
  evaluation_notes?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
  submitted_at: string;
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
}

export interface BidEvaluation {
  id: string;
  bid_request_id: string;
  evaluator_id: string;
  evaluation_criteria?: EvaluationCriteria;
  overall_score?: number;
  notes?: string;
  recommendation: 'highly_recommend' | 'recommend' | 'neutral' | 'not_recommend' | 'reject';
  created_at: string;
  updated_at: string;
}

export interface AttachmentFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploaded_at: string;
}

export interface InsuranceInfo {
  provider?: string;
  policy_number?: string;
  coverage_amount?: number;
  expiration_date?: string;
  certificate_url?: string;
}

export interface EvaluationCriteria {
  price?: number;
  timeline?: number;
  experience?: number;
  references?: number;
  licensing?: number;
  insurance?: number;
}

export interface VendorPerformance {
  id: string;
  name: string;
  hoa_id: string;
  rating?: number;
  total_jobs: number;
  completed_jobs: number;
  completion_rate: number;
  total_bids: number;
  selected_bids: number;
  bid_win_rate: number;
  avg_evaluation_score?: number;
  average_response_time?: number;
  is_active: boolean;
}

export interface BidRequestSummary {
  id: string;
  title: string;
  hoa_id: string;
  status: string;
  priority: string;
  budget_range_min?: number;
  budget_range_max?: number;
  bid_deadline?: string;
  total_bids: number;
  lowest_bid?: number;
  highest_bid?: number;
  average_bid?: number;
  selected_vendor_id?: string;
  awarded_amount?: number;
  created_at: string;
  updated_at: string;
}

// Form interfaces
export interface BidRequestFormData {
  // Step 1: Basic Information
  hoa_id: string;
  title: string;
  description: string;
  location: string;
  number_of_bids_wanted: number;
  
  // Step 2: Project Type
  project_type_id: string;
  category: string;
  
  // Step 3: Project Details (dynamic based on project type)
  project_details: Record<string, any>;
  special_requirements?: string;
  
  // Step 4: Vendor Selection
  selected_vendor_ids: string[];
  allow_public_bidding: boolean;
  
  // Step 5: Budget & Timeline
  budget_range_min?: number;
  budget_range_max?: number;
  preferred_start_date?: string;
  required_completion_date?: string;
  bid_deadline: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Step 6: Files & Review
  attachments: File[];
  
  // Internal
  created_by: string;
  status: 'draft' | 'published';
}

export interface VendorResponseData {
  interested: boolean;
  bid_amount?: number;
  timeline_days?: number;
  timeline_start_date?: string;
  timeline_completion_date?: string;
  proposal_text?: string;
  warranty_terms?: string;
  payment_terms?: string;
  attachments?: File[];
  contact_name: string;
  contact_email: string;
  contact_phone: string;
}

// Email template types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  template_type: 'bid_request' | 'reminder' | 'follow_up' | 'award_notification' | 'rejection_notice';
  variables: string[];
  is_active: boolean;
}

// Import/Export types
export interface ImportResult {
  success: boolean;
  imported_count: number;
  failed_count: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value: any;
}

export interface ImportWarning {
  row: number;
  field: string;
  message: string;
  value: any;
}

// Gravity Forms mapping types
export interface GravityFormField {
  id: string;
  type: string;
  label: string;
  value: any;
  choices?: GravityFormChoice[];
}

export interface GravityFormChoice {
  text: string;
  value: string;
}

export interface GravityFormEntry {
  id: string;
  form_id: string;
  date_created: string;
  fields: Record<string, GravityFormField>;
}

export interface FieldMapping {
  gravity_form_field: string;
  community_intelligence_field: string;
  transformation?: (value: any) => any;
  required: boolean;
}
