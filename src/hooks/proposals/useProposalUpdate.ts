
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Proposal } from '@/types/proposal-types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useProposalUpdate = (leadId?: string) => {
  const queryClient = useQueryClient();
  const queryKey = leadId ? ['proposals', leadId] : ['proposals'];

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Proposal> }) => {
      const { analytics, ...proposalData } = data;
      
      // Convert analytics to JSON-compatible format for storage
      const analytics_data = analytics ? JSON.parse(JSON.stringify(analytics)) : proposalData.analytics_data;
      
      const { data: updatedProposal, error } = await supabase
        .from('proposals')
        .update({
          ...proposalData,
          analytics_data
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      
      const proposal = updatedProposal as Proposal;
      
      if (proposalData.attachments) {
        const { error: deleteError } = await supabase
          .from('proposal_attachments')
          .delete()
          .eq('proposal_id', id);
          
        if (deleteError) {
          console.error('Error deleting existing attachments:', deleteError);
        }
        
        if (proposalData.attachments.length > 0) {
          const attachmentsToInsert = proposalData.attachments.map(attachment => ({
            proposal_id: id,
            name: attachment.name,
            type: attachment.type,
            url: attachment.url,
            size: attachment.size || 0,
            content_type: attachment.content_type
          }));
          
          const { error: attachmentError } = await supabase
            .from('proposal_attachments')
            .insert(attachmentsToInsert);
            
          if (attachmentError) {
            console.error('Error inserting attachments:', attachmentError);
          }
        }
      }
      
      return {
        ...proposal,
        attachments: proposalData.attachments || [],
        analytics: proposal.analytics_data || {}
      };
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
