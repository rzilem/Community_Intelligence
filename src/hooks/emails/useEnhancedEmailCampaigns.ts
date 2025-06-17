
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailCampaignService } from '@/services/email-campaign-service';
import { EmailCampaign } from '@/types/email-campaign-types';

export const useEnhancedEmailCampaigns = () => {
  const queryClient = useQueryClient();

  const {
    data: campaigns = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: emailCampaignService.getCampaigns
  });

  const createCampaignMutation = useMutation({
    mutationFn: emailCampaignService.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
    }
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmailCampaign> }) =>
      emailCampaignService.updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
    }
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: emailCampaignService.deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
    }
  });

  const sendCampaignMutation = useMutation({
    mutationFn: emailCampaignService.sendCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
    }
  });

  return {
    campaigns,
    isLoading,
    error,
    refetch,
    createCampaign: createCampaignMutation.mutateAsync,
    updateCampaign: updateCampaignMutation.mutateAsync,
    deleteCampaign: deleteCampaignMutation.mutateAsync,
    sendCampaign: sendCampaignMutation.mutateAsync,
    isCreating: createCampaignMutation.isPending,
    isUpdating: updateCampaignMutation.isPending,
    isDeleting: deleteCampaignMutation.isPending,
    isSending: sendCampaignMutation.isPending
  };
};
