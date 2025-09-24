import { ProposalRequest, ProposalRequestFormData, ProposalAddress } from '@/types/proposal-request-types';

// Mock data for development
const mockProposalRequests: ProposalRequest[] = [
  {
    id: 'pr-1',
    community_name: 'Sample HOA Community',
    number_of_bids: 3,
    address: {
      streetAddress: '123 Main St',
      city: 'Anytown',
      zipCode: '12345'
    },
    project_type: 'landscaping',
    bid_request_type: 'maintenance',
    work_location: 'common_areas',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'user-1'
  },
  {
    id: 'pr-2',
    community_name: 'Another HOA',
    number_of_bids: 2,
    address: {
      streetAddress: '456 Oak Ave',
      city: 'Sample City',
      zipCode: '67890'
    },
    project_type: 'roofing',
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'user-2'
  }
];

export const submitProposalRequest = async (formData: ProposalRequestFormData, userId: string): Promise<{ data: ProposalRequest | null; error: Error | null }> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newRequest: ProposalRequest = {
      id: `pr-${Date.now()}`,
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
    
    mockProposalRequests.push(newRequest);
    
    return { data: newRequest, error: null };
  } catch (error) {
    console.error('Error submitting proposal request:', error);
    return { data: null, error: error as Error };
  }
};

export const getProposalRequests = async (): Promise<{ data: ProposalRequest[] | null; error: Error | null }> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return { data: [...mockProposalRequests], error: null };
  } catch (error) {
    console.error('Error fetching proposal requests:', error);
    return { data: null, error: error as Error };
  }
};