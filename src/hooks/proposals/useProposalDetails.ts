
import { useCallback } from 'react';
import { Proposal } from '@/types/proposal-types';
import { toast } from 'sonner';

export const useProposalDetails = () => {
  const getProposal = useCallback(async (id: string): Promise<Proposal | null> => {
    try {
      // Mock: Get proposal by ID
      const mockProposal: Proposal = {
        id,
        lead_id: 'mock-lead-1',
        name: 'Sample Proposal',
        status: 'draft',
        content: '<p>This is a mock proposal content</p>',
        amount: 25000,
        signature_required: false,
        sections: [],
        attachments: [],
        analytics: {
          views: 0,
          view_count_by_section: {}
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Mock: Getting proposal', mockProposal);
      return mockProposal;
    } catch (err) {
      console.error("Error in getProposal:", err);
      toast.error("Error loading proposal");
      return null;
    }
  }, []);

  return {
    getProposal
  };
};
