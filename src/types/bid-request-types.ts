
// Community Intelligence Bid Request System - TypeScript Interfaces
// File: src/types/bid-request-types.ts

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
  association_id: string;
  associationId: string; // Dual support
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
  locationData?: any; // For location mapping
  locationNotes?: string; // For location notes
  special_requirements?: string;
  specifications?: {
    timeline?: number;
    budget?: number;
    requirements?: string;
    deliverables?: string;
    projectGoals?: string;
    materialRequirements?: string;
    timelineExpectations?: string;
    specialNotes?: string;
    customQuestions?: { id: string; question: string }[];
  };
  attachments?: AttachmentFile[];
  status: 'draft' | 'published' | 'bidding' | 'evaluating' | 'awarded' | 'completed' | 'cancelled';
  bid_deadline?: string;
  selected_vendor_id?: string;
  awarded_amount?: number;
  awarded_at?: string;
  created_by: string;
  createdBy: string; // Dual support
  created_at: string;
  updated_at: string;
  imageUrl?: string;
  visibility?: string;
  due_date?: string;
  dueDate?: string; // Dual support
  budget?: number;
  vendorNotes?: string; // For vendor selection notes
}

export interface BidRequestWithVendors extends BidRequest {
  vendors?: BidRequestVendor[];
  selectedVendors?: Vendor[];
  totalBids?: number;
  lowestBid?: number;
  highestBid?: number;
  averageBid?: number;
}

export interface BidRequestVendor {
  id: string;
  bidRequestId: string;
  bid_request_id: string; // Dual support
  vendorId: string;
  vendor_id: string; // Dual support
  status: "invited" | "accepted" | "declined" | "submitted";
  quoteAmount?: number;
  quote_amount?: number; // Dual support
  quoteDetails?: Record<string, any>;
  quote_details?: Record<string, any>; // Dual support
  submittedAt?: string;
  submitted_at?: string; // Dual support
  vendor?: Vendor;
}

export interface Vendor {
  id: string;
  hoa_id: string;
  association_id?: string;
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
  include_in_bids?: boolean; // For filtering
  notes?: string;
  category?: string; // Add category for filtering
  hasInsurance?: boolean; // Add insurance flag
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
  hoa_id: string;
  association_id?: string;
  title: string;
  description: string;
  location: string;
  number_of_bids_wanted: number;
  project_type_id: string;
  category: string;
  project_details: Record<string, any>;
  special_requirements?: string;
  selected_vendor_ids: string[];
  allow_public_bidding: boolean;
  budget_range_min?: number;
  budget_range_max?: number;
  preferred_start_date?: string;
  required_completion_date?: string;
  bid_deadline: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments: File[];
  created_by: string;
  createdBy?: string; // Dual support
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

// Integration types
export interface IntegrationConfig {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AIConfig {
  model: string;
  max_tokens: number;
  temperature: number;
  enabled: boolean;
  api_key?: string;
}
