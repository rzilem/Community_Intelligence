
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  recipient_count: number;
  open_count: number;
  click_count: number;
  scheduled_date?: string;
  sent_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignMetrics {
  total_recipients: number;
  sent_count: number;
  open_count: number;
  click_count: number;
  open_rate: number;
  click_rate: number;
  bounce_count: number;
  bounce_rate: number;
}

export const useEmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching campaigns:', fetchError);
        setError('Failed to fetch campaigns');
        setCampaigns([]);
        return;
      }

      setCampaigns((data || []) as EmailCampaign[]);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) {
        console.error('Error deleting campaign:', error);
        throw error;
      }

      // Update local state
      setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  };

  const getCampaignMetrics = async (campaignId: string): Promise<CampaignMetrics | null> => {
    try {
      const campaign = campaigns.find(c => c.id === campaignId);
      if (!campaign) return null;

      return {
        total_recipients: campaign.recipient_count,
        sent_count: campaign.recipient_count,
        open_count: campaign.open_count,
        click_count: campaign.click_count,
        open_rate: campaign.recipient_count > 0 ? (campaign.open_count / campaign.recipient_count) * 100 : 0,
        click_rate: campaign.recipient_count > 0 ? (campaign.click_count / campaign.recipient_count) * 100 : 0,
        bounce_count: 0,
        bounce_rate: 0,
      };
    } catch (error) {
      console.error('Error getting campaign metrics:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return {
    campaigns,
    isLoading,
    error,
    fetchCampaigns,
    deleteCampaign,
    getCampaignMetrics,
  };
};
