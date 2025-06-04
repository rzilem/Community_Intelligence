
import { useSupabaseQuery, useSupabaseCreate, useSupabaseUpdate, useSupabaseDelete } from '@/hooks/supabase';
import { EmailCampaign, CampaignMetrics } from '@/types/email-types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';

export const useEmailCampaigns = () => {
  const { 
    data: campaigns = [],
    isLoading,
    error,
    refetch
  } = useSupabaseQuery<EmailCampaign[]>('email_campaigns', {
    order: { column: 'created_at', ascending: false }
  });

  const createCampaign = useSupabaseCreate<EmailCampaign>('email_campaigns', {
    onSuccess: () => {
      toast.success('Campaign created successfully');
      refetch();
    }
  });

  const updateCampaign = useSupabaseUpdate<EmailCampaign>('email_campaigns', {
    onSuccess: () => {
      toast.success('Campaign updated successfully');
      refetch();
    }
  });

  const deleteCampaign = useSupabaseDelete('email_campaigns', {
    onSuccess: () => {
      toast.success('Campaign deleted successfully');
      refetch();
    }
  });

  const getCampaignRecipients = useCallback(async (campaignId: string) => {
    const { data, error } = await supabase
      .from('campaign_recipients' as any)
      .select('*, leads(name, email)')
      .eq('campaign_id', campaignId);
      
    if (error) {
      toast.error(`Error loading campaign recipients: ${error.message}`);
      return [];
    }
    
    return data as any[];
  }, []);

  const getCampaignMetrics = useCallback(
    async (campaignId: string): Promise<CampaignMetrics | null> => {
      const { data, error } = await supabase.rpc('get_campaign_metrics', {
        p_campaign_id: campaignId
      });

      if (error) {
        toast.error(`Error loading campaign metrics: ${error.message}`);
        return null;
      }

      return data as CampaignMetrics;
    },
    []
  );

  return {
    campaigns,
    isLoading,
    error,
    createCampaign: createCampaign.mutateAsync,
    updateCampaign: updateCampaign.mutateAsync,
    deleteCampaign: deleteCampaign.mutateAsync,
    getCampaignRecipients,
    getCampaignMetrics,
    refreshCampaigns: refetch
  };
};
