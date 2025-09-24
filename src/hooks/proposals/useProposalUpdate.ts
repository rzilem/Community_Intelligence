
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Proposal } from '@/types/proposal-types';
import { toast } from 'sonner';

export interface UpdateProposalParams {
  id: string;
  data: Partial<Proposal>;
}

export const useProposalUpdate = (leadId?: string) => {
  const queryClient = useQueryClient();
  const queryKey = leadId ? ['proposals', leadId] : ['proposals'];

  const mutation = useMutation({
    mutationFn: async ({ id, data }: UpdateProposalParams) => {
      // Mock: Update proposal
      const updatedProposal: Proposal = {
        id,
        lead_id: data.lead_id || 'mock-lead-1',
        name: data.name || 'Updated Proposal',
        status: data.status || 'draft',
        content: data.content || '',
        amount: data.amount || 0,
        signature_required: data.signature_required || false,
        sections: data.sections || [],
        attachments: data.attachments || [],
        analytics: data.analytics || {
          views: 0,
          view_count_by_section: {}
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Mock: Updating proposal', updatedProposal);
      return updatedProposal;
    },
    onSuccess: () => {
      toast.success('Proposal updated successfully');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(`Error updating proposal: ${error.message}`);
    }
  });

  return mutation.mutate;
};
