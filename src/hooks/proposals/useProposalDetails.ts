
import { useCallback } from 'react';
import { Proposal } from '@/types/proposal-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProposalDetails = () => {
  const getProposal = useCallback(async (id: string): Promise<Proposal | null> => {
    try {
      const { data: proposal, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        toast.error(`Error loading proposal: ${error.message}`);
        return null;
      }
      
      const { data: attachments, error: attachmentsError } = await supabase
        .from('proposal_attachments')
        .select('*')
        .eq('proposal_id', id);
        
      if (attachmentsError) {
        console.error('Error fetching attachments:', attachmentsError);
      }
      
      // Use type assertion to handle analytics_data
      const dbProposal = proposal as any;
      
      return {
        ...dbProposal,
        attachments: attachments || [],
        sections: dbProposal.sections || [],
        analytics: dbProposal.analytics_data || {
          views: 0,
          view_count_by_section: {}
        }
      } as Proposal;
    } catch (err) {
      console.error("Error in getProposal:", err);
      return null;
    }
  }, []);

  return {
    getProposal
  };
};
