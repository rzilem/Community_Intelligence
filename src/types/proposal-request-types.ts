
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

// Function to submit proposal request
export async function submitProposalRequest(
  formData: ProposalRequestFormData, 
  userId: string
): Promise<{ data: ProposalRequest | null; error: Error | null }> {
  try {
    // This would typically make an API call to save the proposal request
    // For now, we'll simulate success
    const proposalRequest: ProposalRequest = {
      id: crypto.randomUUID(),
      community_name: formData.communityName,
      number_of_bids: parseInt(formData.numberOfBids),
      address: formData.address,
      project_type: formData.projectType,
      bid_request_type: formData.bidRequestType,
      work_location: formData.workLocation,
      cpa_service: formData.cpaService,
      road_work_types: formData.roadWorkTypes,
      fence_location: formData.fenceLocation,
      additional_details: formData.additionalDetails,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: userId
    };

    return { data: proposalRequest, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
