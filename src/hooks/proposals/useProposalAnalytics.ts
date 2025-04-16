
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProposalAnalytics } from '@/types/proposal-types';
import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';

export const useProposalAnalytics = (leadId?: string) => {
  const queryClient = useQueryClient();
  const queryKey = leadId ? ['proposals', leadId] : ['proposals'];

  const updateAnalyticsMutation = useMutation({
    mutationFn: async ({ proposalId, analyticsData }: { proposalId: string, analyticsData: Partial<ProposalAnalytics> }) => {
      const { data: currentProposal, error: fetchError } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .single();
        
      if (fetchError) throw new Error(fetchError.message);
      
      // Type assertion to handle analytics_data
      const proposal = currentProposal as any;
      
      // Combine existing analytics with new data
      const currentAnalytics = proposal.analytics_data || {
        views: 0,
        view_count_by_section: {}
      };
      
      const updatedAnalytics = {
        ...currentAnalytics,
        ...analyticsData
      };
      
      const { error } = await supabase
        .from('proposals')
        .update({
          analytics_data: updatedAnalytics
        })
        .eq('id', proposalId);
        
      if (error) throw new Error(error.message);
      return { proposalId, analyticsData: updatedAnalytics };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error(`Error updating analytics: ${error.message}`);
    }
  });

  const trackProposalView = useCallback(async (proposalId: string, sectionId?: string): Promise<void> => {
    try {
      const { data: proposal, error: fetchError } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching proposal for tracking:', fetchError);
        return;
      }
      
      // Type assertion to handle analytics_data
      const dbProposal = proposal as any;
      
      // Get current analytics data or initialize with defaults
      const analytics = dbProposal.analytics_data || {
        views: 0,
        view_count_by_section: {},
        initial_view_date: null,
        last_view_date: null
      };
      
      const updatedAnalytics = {
        ...analytics,
        views: (analytics.views || 0) + 1,
        last_view_date: new Date().toISOString(),
        initial_view_date: analytics.initial_view_date || new Date().toISOString()
      };
      
      if (sectionId) {
        const viewCountBySection = analytics.view_count_by_section || {};
        const sectionCount = viewCountBySection[sectionId] || 0;
        
        updatedAnalytics.view_count_by_section = {
          ...viewCountBySection,
          [sectionId]: sectionCount + 1
        };
        
        let maxViews = 0;
        let mostViewedSection = '';
        
        Object.entries(updatedAnalytics.view_count_by_section).forEach(([section, count]) => {
          const countNum = count as number;
          if (countNum > maxViews) {
            maxViews = countNum;
            mostViewedSection = section;
          }
        });
        
        if (mostViewedSection) {
          updatedAnalytics.most_viewed_section = mostViewedSection;
        }
      }
      
      if (proposal.status === 'sent') {
        await supabase
          .from('proposals')
          .update({
            status: 'viewed',
            viewed_date: new Date().toISOString(),
            analytics_data: updatedAnalytics
          })
          .eq('id', proposalId);
      } else {
        await supabase
          .from('proposals')
          .update({
            analytics_data: updatedAnalytics
          })
          .eq('id', proposalId);
      }
    } catch (err) {
      console.error('Error tracking proposal view:', err);
    }
  }, []);

  return {
    updateAnalytics: updateAnalyticsMutation.mutate,
    trackProposalView
  };
};
