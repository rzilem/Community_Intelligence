
import { useState, useEffect } from 'react';
import { emailCampaignService } from '@/services/email-campaign-service';
import { EmailCampaign } from '@/types/email-campaign-types';

export const useEmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await emailCampaignService.getCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to fetch campaigns');
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchCampaigns();
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return {
    campaigns,
    isLoading,
    error,
    refetch
  };
};
