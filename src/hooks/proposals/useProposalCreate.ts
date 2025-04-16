
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Proposal, ProposalSection } from '@/types/proposal-types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export const useProposalCreate = (leadId?: string) => {
  const queryClient = useQueryClient();
  const queryKey = leadId ? ['proposals', leadId] : ['proposals'];

  const mutation = useMutation({
    mutationFn: async (proposalData: Partial<Proposal>) => {
      const { analytics, attachments, sections, ...rest } = proposalData;
      
      // Convert analytics to JSON-compatible format for storage
      const analytics_data = analytics ? JSON.parse(JSON.stringify(analytics)) : {
        views: 0,
        view_count_by_section: {}
      };
      
      // Convert sections to JSON-compatible format
      const sectionsJson = sections ? JSON.parse(JSON.stringify(sections)) : [];
      
      // Ensure required fields are present
      if (!rest.lead_id && leadId) {
        rest.lead_id = leadId;
      }
      
      // Ensure name is present
      if (!rest.name) {
        throw new Error('Proposal name is required');
      }

      const { data: proposal, error } = await supabase
        .from('proposals')
        .insert({
          lead_id: rest.lead_id,
          name: rest.name,
          status: rest.status || 'draft',
          content: rest.content || '',
          amount: rest.amount || 0,
          signature_required: rest.signature_required || false,
          sections: sectionsJson as Json,
          analytics_data
        })
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      
      const createdProposal = proposal as any;
      const proposalId = createdProposal.id;
      
      if (!proposalId) {
        throw new Error('Failed to retrieve ID from created proposal');
      }
      
      if (attachments && attachments.length > 0) {
        const attachmentsToInsert = attachments.map(attachment => ({
          proposal_id: proposalId,
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
      
      return {
        ...createdProposal,
        attachments: attachments || [],
        sections: createdProposal.sections ? (createdProposal.sections as unknown as ProposalSection[]) : [],
        analytics: createdProposal.analytics_data || {
          views: 0,
          view_count_by_section: {}
        }
      } as Proposal;
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
