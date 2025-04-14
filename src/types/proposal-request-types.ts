
export interface ProposalAddress {
  streetAddress: string;
  addressLine2?: string;
  city: string;
  zipCode: string;
}

export interface ProposalRequestFormData {
  communityName: string;
  numberOfBids: string;
  address: ProposalAddress;
  projectType: string;
  bidRequestType?: string;
  workLocation?: string;
  cpaService?: string;
  roadWorkTypes?: string[];
  fenceLocation?: string;
  additionalDetails?: string;
}

export interface ProposalRequest {
  id?: string;
  community_name: string;
  number_of_bids: number;
  address: ProposalAddress;
  project_type: string;
  bid_request_type?: string;
  work_location?: string;
  cpa_service?: string;
  road_work_types?: string[];
  fence_location?: string;
  additional_details?: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface FormStepProps {
  formData: ProposalRequestFormData;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}
