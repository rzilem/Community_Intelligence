
import { useState } from 'react';
import { EmailCampaign, EmailTemplate } from '@/types/email-campaign-types';
import { useEnhancedEmailCampaigns } from './useEnhancedEmailCampaigns';
import { toast } from 'sonner';

export const useCampaignManagement = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    campaigns,
    isLoading,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    isCreating: apiCreating,
    isUpdating: apiUpdating,
    isDeleting: apiDeleting,
    isSending: apiSending
  } = useEnhancedEmailCampaigns();

  const handleCreateCampaign = async (data: Partial<EmailCampaign>) => {
    try {
      await createCampaign(data);
      toast.success('Campaign created successfully');
      setIsCreating(false);
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  const handleUpdateCampaign = async (id: string, data: Partial<EmailCampaign>) => {
    try {
      await updateCampaign({ id, data });
      toast.success('Campaign updated successfully');
      setIsEditing(false);
      setSelectedCampaign(null);
    } catch (error) {
      toast.error('Failed to update campaign');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      await deleteCampaign(id);
      toast.success('Campaign deleted successfully');
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const handleSendCampaign = async (id: string) => {
    try {
      await sendCampaign(id);
      toast.success('Campaign sent successfully');
    } catch (error) {
      toast.error('Failed to send campaign');
    }
  };

  const handleScheduleCampaign = async (id: string, sendAt: string) => {
    try {
      await updateCampaign({ id, data: { status: 'scheduled', send_at: sendAt } });
      toast.success('Campaign scheduled successfully');
    } catch (error) {
      toast.error('Failed to schedule campaign');
    }
  };

  return {
    campaigns,
    isLoading,
    selectedCampaign,
    setSelectedCampaign,
    isCreating,
    setIsCreating,
    isEditing,
    setIsEditing,
    handleCreateCampaign,
    handleUpdateCampaign,
    handleDeleteCampaign,
    handleSendCampaign,
    handleScheduleCampaign,
    isProcessing: apiCreating || apiUpdating || apiDeleting || apiSending
  };
};
