
export interface BidRequest {
  id: string;
  association_id: string;
  hoa_id?: string;
  maintenance_request_id?: string;
  title: string;
  description?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget_range_min?: number;
  budget_range_max?: number;
  budget?: number;
  preferred_start_date?: string;
  required_completion_date?: string;
  location?: string;
  special_requirements?: string;
  attachments?: any[];
  status: 'draft' | 'published' | 'bidding' | 'evaluating' | 'awarded' | 'completed' | 'cancelled';
  visibility: 'private' | 'association' | 'public';
  bid_deadline?: string;
  selected_vendor_id?: string;
  awarded_amount?: number;
  awarded_at?: string;
  created_by?: string;
  assigned_to?: string;
  due_date?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface BidRequestVendor {
  id: string;
  bid_request_id: string;
  vendor_id: string;
  status: 'invited' | 'accepted' | 'declined' | 'submitted';
  quote_amount?: number;
  quote_details?: any;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BidRequestWithVendors extends BidRequest {
  vendors?: BidRequestVendor[];
}

export interface Vendor {
  id: string;
  hoa_id?: string;
  association_id?: string;
  name: string;
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
  is_active?: boolean;
  include_in_bids?: boolean;
  notes?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}
