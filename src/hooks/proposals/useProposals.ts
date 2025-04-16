import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Proposal, ProposalAttachment, ProposalAnalytics } from '@/types/proposal-types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';

export const useProposals = (leadId?: string) => {
  const queryClient = useQueryClient();
  
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
        
        // Fetch attachments for each proposal
        const proposalsWithAttachments = await Promise.all(
          (data || []).map(async (proposal: any) => {
            // Fetch attachments
            const { data: attachments, error: attachmentsError } = await supabase
              .from('proposal_attachments')
              .select('*')
              .eq('proposal_id', proposal.id);
              
            if (attachmentsError) {
              console.error('Error fetching attachments:', attachmentsError);
            }
            
            // Build complete proposal object - use analytics data embedded in the proposal or default values
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
        console.error("Error in useProposals:", err);
        throw err;
      }
    }
  });

  const createProposalMutation = useMutation({
    mutationFn: async (proposalData: Partial<Proposal>) => {
      // 1. Insert the proposal
      const { data: proposal, error } = await supabase
        .from('proposals')
        .insert({
          lead_id: proposalData.lead_id,
          template_id: proposalData.template_id,
          name: proposalData.name,
          status: proposalData.status || 'draft',
          content: proposalData.content || '',
          amount: proposalData.amount || 0,
          signature_required: proposalData.signature_required || false,
          sections: proposalData.sections || [],
          analytics_data: {
            views: 0,
            view_count_by_section: {}
          }
        })
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      
      // Type assertion to ensure we have the required ID
      const createdProposal = proposal as any;
      const proposalId = createdProposal.id;
      
      if (!proposalId) {
        throw new Error('Failed to retrieve ID from created proposal');
      }
      
      // 2. If attachments exist, insert them
      if (proposalData.attachments && proposalData.attachments.length > 0) {
        const attachmentsToInsert = proposalData.attachments.map(attachment => ({
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
          // Don't throw here, we already have the proposal created
        }
      }
      
      // Return a properly typed Proposal object
      return {
        ...createdProposal,
        attachments: proposalData.attachments || [],
        analytics: {
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

  const updateProposalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Proposal> }) => {
      // Extract analytics to handle separately
      const { analytics, ...proposalData } = data;
      
      // 1. Update the proposal
      const { data: updatedProposal, error } = await supabase
        .from('proposals')
        .update({
          lead_id: proposalData.lead_id,
          template_id: proposalData.template_id,
          name: proposalData.name,
          status: proposalData.status,
          content: proposalData.content,
          amount: proposalData.amount,
          sent_date: proposalData.sent_date,
          viewed_date: proposalData.viewed_date,
          responded_date: proposalData.responded_date,
          client_portal_link: proposalData.client_portal_link,
          signature_required: proposalData.signature_required,
          signed_date: proposalData.signed_date,
          signed_by: proposalData.signed_by,
          signature_data: proposalData.signature_data,
          sections: proposalData.sections,
          analytics_data: analytics || proposalData.analytics_data
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      
      // Type assertion
      const proposal = updatedProposal as any;
      
      // 2. If attachments exist, handle them
      if (proposalData.attachments) {
        // First, delete existing attachments
        const { error: deleteError } = await supabase
          .from('proposal_attachments')
          .delete()
          .eq('proposal_id', id);
          
        if (deleteError) {
          console.error('Error deleting existing attachments:', deleteError);
        }
        
        // Then insert new ones
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
      
      // Return a properly typed Proposal object
      return {
        ...proposal,
        attachments: proposalData.attachments || [],
        analytics: analytics || proposal.analytics_data
      } as Proposal;
    },
    onSuccess: () => {
      toast.success('Proposal updated successfully');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(`Error updating proposal: ${error.message}`);
    }
  });

  const deleteProposalMutation = useMutation({
    mutationFn: async (id: string) => {
      // Delete proposal (attachments will be cascade deleted due to FK constraint)
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);
        
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      toast.success('Proposal deleted successfully');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(`Error deleting proposal: ${error.message}`);
    }
  });

  const updateAnalyticsMutation = useMutation({
    mutationFn: async ({ proposalId, analyticsData }: { proposalId: string, analyticsData: Partial<ProposalAnalytics> }) => {
      // Update the analytics_data field directly on the proposal
      const { error } = await supabase
        .from('proposals')
        .update({
          analytics_data: analyticsData
        })
        .eq('id', proposalId);
        
      if (error) throw new Error(error.message);
      return { proposalId, analyticsData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error(`Error updating analytics: ${error.message}`);
    }
  });

  const uploadAttachment = async (file: File, proposalId?: string): Promise<ProposalAttachment> => {
    // 1. Upload the file to storage
    const fileName = `${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('proposal_attachments')
      .upload(fileName, file);

    if (uploadError) {
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }
    
    // 2. Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('proposal_attachments')
      .getPublicUrl(fileName);
      
    const attachmentData: ProposalAttachment = {
      id: `temp-${Date.now()}`,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' :
            file.type === 'application/pdf' ? 'pdf' :
            file.type.includes('document') ? 'document' : 'other',
      url: publicUrl,
      size: file.size,
      content_type: file.type,
      created_at: new Date().toISOString()
    };
    
    // 3. If proposalId is provided, create an attachment record
    if (proposalId) {
      const { data, error } = await supabase
        .from('proposal_attachments')
        .insert({
          proposal_id: proposalId,
          name: attachmentData.name,
          type: attachmentData.type,
          url: attachmentData.url,
          size: attachmentData.size,
          content_type: attachmentData.content_type
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating attachment record:', error);
      } else if (data) {
        // Use the DB-generated ID
        attachmentData.id = data.id;
      }
    }
    
    return attachmentData;
  };

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
      
      // Get attachments
      const { data: attachments, error: attachmentsError } = await supabase
        .from('proposal_attachments')
        .select('*')
        .eq('proposal_id', id);
        
      if (attachmentsError) {
        console.error('Error fetching attachments:', attachmentsError);
      }
      
      return {
        ...(proposal as any),
        attachments: attachments || [],
        analytics: proposal.analytics_data || {
          views: 0,
          view_count_by_section: {}
        }
      } as Proposal;
    } catch (err) {
      console.error("Error in getProposal:", err);
      return null;
    }
  }, []);

  const trackProposalView = useCallback(async (proposalId: string, sectionId?: string): Promise<void> => {
    try {
      // Get the current proposal
      const { data: proposal, error: fetchError } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching proposal for tracking:', fetchError);
        return;
      }
      
      // Get current analytics data or initialize with defaults
      const analytics = proposal.analytics_data || {
        views: 0,
        view_count_by_section: {},
        initial_view_date: null,
        last_view_date: null
      };
      
      // Update analytics
      const updatedAnalytics = {
        ...analytics,
        views: (analytics.views || 0) + 1,
        last_view_date: new Date().toISOString(),
        initial_view_date: analytics.initial_view_date || new Date().toISOString()
      };
      
      // If a section was viewed, update section-specific stats
      if (sectionId) {
        const viewCountBySection = analytics.view_count_by_section || {};
        const sectionCount = viewCountBySection[sectionId] || 0;
        
        updatedAnalytics.view_count_by_section = {
          ...viewCountBySection,
          [sectionId]: sectionCount + 1
        };
        
        // Find most viewed section
        let maxViews = 0;
        let mostViewedSection = '';
        
        Object.entries(updatedAnalytics.view_count_by_section).forEach(([section, count]) => {
          if (count > maxViews) {
            maxViews = count;
            mostViewedSection = section;
          }
        });
        
        if (mostViewedSection) {
          updatedAnalytics.most_viewed_section = mostViewedSection;
        }
      }
      
      // Update the proposal status to 'viewed' if it's currently 'sent'
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
        // Otherwise just update the analytics
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
    proposals,
    isLoading,
    error,
    createProposal: createProposalMutation.mutate,
    updateProposal: updateProposalMutation.mutate,
    deleteProposal: deleteProposalMutation.mutate,
    updateAnalytics: updateAnalyticsMutation.mutate,
    getProposal,
    uploadAttachment,
    trackProposalView,
    refreshProposals: refetch
  };
};
