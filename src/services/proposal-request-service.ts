
import { supabase } from '@/integrations/supabase/client';
import { ProposalRequest, ProposalRequestFormData } from '@/types/proposal-request-types';

export const submitProposalRequest = async (formData: ProposalRequestFormData, userId: string): Promise<{ data: ProposalRequest | null; error: Error | null }> => {
  try {
    const proposalRequest = {
      community_name: formData.communityName,
      number_of_bids: parseInt(formData.numberOfBids),
      address: formData.address as any, // Cast to any to avoid type issues with Json
      project_type: formData.projectType,
      bid_request_type: formData.bidRequestType,
      work_location: formData.workLocation,
      cpa_service: formData.cpaService,
      road_work_types: formData.roadWorkTypes,
      fence_location: formData.fenceLocation,
      additional_details: formData.additionalDetails,
      status: 'pending',
      created_by: userId
    };

    const { data, error } = await supabase
      .from('proposal_requests')
      .insert(proposalRequest)
      .select()
      .single();

    if (error) throw error;
    
    return { data: data as ProposalRequest, error: null };
  } catch (error) {
    console.error('Error submitting proposal request:', error);
    return { data: null, error: error as Error };
  }
};

export const getProposalRequests = async (): Promise<{ data: ProposalRequest[] | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('proposal_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { data: data as ProposalRequest[], error: null };
  } catch (error) {
    console.error('Error fetching proposal requests:', error);
    return { data: null, error: error as Error };
  }
};
