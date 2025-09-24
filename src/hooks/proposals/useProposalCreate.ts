
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Proposal, ProposalSection } from '@/types/proposal-types';
import { toast } from 'sonner';

export const useProposalCreate = (leadId?: string) => {
  const queryClient = useQueryClient();
  const queryKey = leadId ? ['proposals', leadId] : ['proposals'];

  const mutation = useMutation({
    mutationFn: async (proposalData: Partial<Proposal>) => {
      const { analytics, attachments, sections, ...rest } = proposalData;
      
      // Ensure required fields are present
      if (!rest.lead_id && leadId) {
        rest.lead_id = leadId;
      }
      
      // Ensure name is present
      if (!rest.name) {
        throw new Error('Proposal name is required');
      }

      // Mock: Create proposal
      const newProposal: Proposal = {
        id: Date.now().toString(),
        lead_id: rest.lead_id || '',
        name: rest.name,
        status: rest.status || 'draft',
        content: rest.content || '',
        amount: rest.amount || 0,
        signature_required: rest.signature_required || false,
        sections: sections || [],
        attachments: attachments || [],
        analytics: analytics || {
          views: 0,
          view_count_by_section: {}
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Mock: Creating proposal', newProposal);
      return newProposal;
    },
    onSuccess: () => {
      toast.success('Proposal created successfully');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(`Error creating proposal: ${error.message}`);
    }
  });

  return mutation.mutate;
};
