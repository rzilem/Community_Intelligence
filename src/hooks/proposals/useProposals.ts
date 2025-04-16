
import { useProposalQuery } from './useProposalQuery';
import { useProposalCreate } from './useProposalCreate';
import { useProposalUpdate } from './useProposalUpdate';
import { useProposalDelete } from './useProposalDelete';
import { useProposalAnalytics } from './useProposalAnalytics';
import { useProposalAttachments } from './useProposalAttachments';
import { useProposalDetails } from './useProposalDetails';

export const useProposals = (leadId?: string) => {
  const { proposals, isLoading, error, refreshProposals } = useProposalQuery(leadId);
  const createProposal = useProposalCreate(leadId);
  const updateProposal = useProposalUpdate(leadId);
  const deleteProposal = useProposalDelete(leadId);
  const { updateAnalytics, trackProposalView } = useProposalAnalytics(leadId);
  const { uploadAttachment } = useProposalAttachments();
  const { getProposal } = useProposalDetails();

  return {
    proposals,
    isLoading,
    error,
    createProposal,
    updateProposal,
    deleteProposal,
    updateAnalytics,
    getProposal,
    uploadAttachment,
    trackProposalView,
    refreshProposals
  };
};
