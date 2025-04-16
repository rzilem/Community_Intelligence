
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Proposal, ProposalSection } from '@/types/proposal-types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface UpdateProposalParams {
  id: string;
  data: Partial<Proposal>;
}

export const useProposalUpdate = (leadId?: string) => {
  const queryClient = useQueryClient();
  const queryKey = leadId ? ['proposals', leadId] : ['proposals'];

  const mutation = useMutation({
    mutationFn: async ({ id, data }: UpdateProposalParams) => {
      const { analytics, attachments, sections, ...rest } = data;
      
      const updateData: any = { ...rest };
      
      // Only include analytics data if it exists
      if (analytics) {
        updateData.analytics_data = JSON.parse(JSON.stringify(analytics));
      }
      
      // Only include sections if they exist - convert to JSON-compatible format
      if (sections) {
        updateData.sections = JSON.parse(JSON.stringify(sections)) as Json;
      }
      
      const { data: updatedProposal, error } = await supabase
        .from('proposals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      
      // Process attachments if provided
      if (attachments && attachments.length > 0) {
        // Filter out attachments that already have IDs (already in the database)
        const newAttachments = attachments.filter(att => att.id.startsWith('temp-'));
        
        if (newAttachments.length > 0) {
          const attachmentsToInsert = newAttachments.map(attachment => ({
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
            console.error('Error inserting new attachments:', attachmentError);
          }
        }
      }
      
      // Safely cast back to the proper types
      const proposalWithTypedSections = {
        ...updatedProposal,
        attachments: attachments || [],
        sections: updatedProposal.sections ? (updatedProposal.sections as unknown as ProposalSection[]) : [],
        analytics: updatedProposal.analytics_data || {
          views: 0,
          view_count_by_section: {}
        }
      } as Proposal;
      
      return proposalWithTypedSections;
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
