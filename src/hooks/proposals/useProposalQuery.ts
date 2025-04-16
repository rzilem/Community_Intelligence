
import { useQuery } from '@tanstack/react-query';
import { Proposal, ProposalAttachment } from '@/types/proposal-types';
import { supabase } from '@/integrations/supabase/client';

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
      try {
        let query = supabase.from('proposals').select('*');
        
        if (leadId) {
          query = query.eq('lead_id', leadId);
        }
        
        const { data, error } = await query
          .order('created_at', { ascending: false });
        
        if (error) {
          throw new Error(error.message);
        }
        
        const proposalsWithAttachments = await Promise.all(
          (data || []).map(async (proposal: any) => {
            const { data: attachments, error: attachmentsError } = await supabase
              .from('proposal_attachments')
              .select('*')
              .eq('proposal_id', proposal.id);
              
            if (attachmentsError) {
              console.error('Error fetching attachments:', attachmentsError);
            }
            
            return {
              ...proposal,
              attachments: attachments || [],
              analytics: proposal.analytics_data || {
                views: 0,
                view_count_by_section: {}
              }
            } as Proposal;
          })
        );
        
        return proposalsWithAttachments;
      } catch (err) {
        console.error("Error in useProposalQuery:", err);
        throw err;
      }
    }
  });

  return {
    proposals,
    isLoading,
    error,
    refreshProposals: refetch
  };
};
