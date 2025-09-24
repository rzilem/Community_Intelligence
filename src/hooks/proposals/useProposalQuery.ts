
import { useQuery } from '@tanstack/react-query';
import { Proposal } from '@/types/proposal-types';

export const useProposalQuery = (leadId?: string) => {
  const queryKey = leadId ? ['proposals', leadId] : ['proposals'];
  
  const { 
    data: proposals = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<Proposal[]> => {
      // Mock: Return sample proposals
      const mockProposals: Proposal[] = [
        {
          id: '1',
          lead_id: leadId || 'mock-lead-1',
          name: 'Property Management Proposal',
          status: 'draft',
          content: '<p>Comprehensive property management services</p>',
          amount: 25000,
          signature_required: false,
          sections: [],
          attachments: [],
          analytics: {
            views: 5,
            view_count_by_section: {}
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      console.log('Mock: Fetching proposals for lead:', leadId);
      return leadId ? mockProposals.filter(p => p.lead_id === leadId) : mockProposals;
    }
  });

  return {
    proposals,
    isLoading,
    error,
    refreshProposals: refetch
  };
};
