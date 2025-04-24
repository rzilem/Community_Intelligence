export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted' | 'lost';

export interface LeadAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  created_at: string;
}

export interface LeadFollowUp {
  id: string;
  lead_id: string;
  type: 'email' | 'call' | 'meeting' | 'other';
  content: string;
  scheduled_date: string;
  completed_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: LeadStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  tracking_number?: string;
  
  // Basic Association Information
  association_name?: string;
  association_type?: string;
  current_management?: string;
  number_of_units?: number;
  management_type?: string;
  new_build_or_existing?: 'new-build' | 'existing';
  
  // Board & Meeting Information
  board_members?: string;
  board_meetings_per_year?: string;
  annual_meetings_per_year?: string;
  committee_meetings_per_year?: string;
  scheduled_meetings?: string;
  sos_url?: string;
  
  // Management Information
  onsite_management_office?: 'yes' | 'no';
  regional_visits_per_month?: string;
  inspections_per_month?: string;
  has_received_notice?: 'yes' | 'no' | 'pending';
  previous_management_company?: string;
  active_projects?: string;
  
  // Legal Information
  collection_attorney?: string;
  collection_assigned_attorney?: string;
  current_lawsuits?: string;
  current_insurance_claims?: string;
  current_special_assessments?: string;
  contact_info_legal?: string;
  contract_link?: string;
  
  // Financial Information
  billing_type?: string;
  billing_cycle?: string;
  annual_budget?: string;
  fein_number?: string;
  cash_on_hand?: string;
  financial_grade?: string;
  reserves?: 'yes' | 'no' | 'partial';
  insurance_expiration_date?: string;
  ballpark_on_funds?: string;
  
  // Other existing fields
  first_name?: string;
  last_name?: string;
  street_address?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  uploaded_files?: LeadAttachment[] | any;
  additional_requirements?: string;
  html_content?: string;
  
  // New properties
  lead_score: number;
  last_follow_up?: string;
  next_follow_up?: string;
  follow_up_sequence: number;
  proposal_count: number;
}

// Import the LeadColumn type
import { LeadColumn } from '@/hooks/leads/useTableColumns';

export const LEAD_COLUMN_DEFINITIONS: LeadColumn[] = [
  { id: 'name', label: 'Name', accessorKey: 'name', defaultVisible: true },
  { id: 'association_name', label: 'Association Name', accessorKey: 'association_name', defaultVisible: true },
  { id: 'association_type', label: 'Association Type', accessorKey: 'association_type', defaultVisible: true },
  { id: 'number_of_units', label: 'Units', accessorKey: 'number_of_units', defaultVisible: true },
  { id: 'email', label: 'Email', accessorKey: 'email', defaultVisible: true },
  { id: 'city', label: 'City', accessorKey: 'city', defaultVisible: true },
  { id: 'phone', label: 'Phone', accessorKey: 'phone', defaultVisible: true },
  { id: 'street_address', label: 'Address', accessorKey: 'street_address', defaultVisible: true },
  { id: 'status', label: 'Status', accessorKey: 'status', defaultVisible: true },
  { id: 'source', label: 'Source', accessorKey: 'source', defaultVisible: true },
  { id: 'created_at', label: 'Created', accessorKey: 'created_at', defaultVisible: true },
  { id: 'company', label: 'Company', accessorKey: 'company', defaultVisible: false },
  { id: 'state', label: 'State', accessorKey: 'state', defaultVisible: false },
  { id: 'address_line2', label: 'Address Line 2', accessorKey: 'address_line2', defaultVisible: false },
  { id: 'zip', label: 'ZIP', accessorKey: 'zip', defaultVisible: false },
  { id: 'current_management', label: 'Current Management', accessorKey: 'current_management', defaultVisible: false },
  { id: 'first_name', label: 'First Name', accessorKey: 'first_name', defaultVisible: false },
  { id: 'last_name', label: 'Last Name', accessorKey: 'last_name', defaultVisible: false },
  { id: 'additional_requirements', label: 'Additional Requirements', accessorKey: 'additional_requirements', defaultVisible: false },
  { id: 'html_content', label: 'Original Email', accessorKey: 'html_content', defaultVisible: false },
  { id: 'updated_at', label: 'Updated', accessorKey: 'updated_at', defaultVisible: false },
  { id: 'tracking_number', label: 'Tracking Number', accessorKey: 'tracking_number', defaultVisible: false },
  { id: 'lead_score', label: 'Score', accessorKey: 'lead_score', defaultVisible: true },
  { id: 'next_follow_up', label: 'Next Follow-up', accessorKey: 'next_follow_up', defaultVisible: true },
  { id: 'proposal_count', label: 'Proposals', accessorKey: 'proposal_count', defaultVisible: true }
];

// Add LeadDocument type
export interface LeadDocument {
  id: string;
  lead_id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  description?: string;
  uploaded_by?: string;
  uploaded_at: string;
}
