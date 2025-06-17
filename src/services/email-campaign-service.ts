
import { supabase } from '@/integrations/supabase/client';
import { EmailCampaign, EmailTemplate, CampaignRecipient, CampaignMetrics } from '@/types/email-campaign-types';

export const emailCampaignService = {
  // Campaign Management
  getCampaigns: async (): Promise<EmailCampaign[]> => {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getCampaignById: async (id: string): Promise<EmailCampaign | null> => {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  createCampaign: async (campaign: Partial<EmailCampaign>): Promise<EmailCampaign> => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('email_campaigns')
      .insert({
        name: campaign.name || 'New Campaign',
        subject: campaign.subject || '',
        body: campaign.body || '',
        status: campaign.status || 'draft',
        template_id: campaign.template_id,
        send_at: campaign.send_at,
        target_audience: campaign.target_audience || {},
        campaign_settings: campaign.campaign_settings || {},
        created_by: user.user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateCampaign: async (id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign> => {
    const { data, error } = await supabase
      .from('email_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteCampaign: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('email_campaigns')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Template Management
  getTemplates: async (): Promise<EmailTemplate[]> => {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match our types
    return (data || []).map(template => ({
      ...template,
      merge_tags: Array.isArray(template.merge_tags) ? template.merge_tags : []
    })) as EmailTemplate[];
  },

  createTemplate: async (template: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        name: template.name || 'New Template',
        subject: template.subject || '',
        body: template.body || '',
        category: template.category || 'custom',
        description: template.description,
        preview_text: template.preview_text,
        merge_tags: template.merge_tags || [],
        created_by: user.user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      merge_tags: Array.isArray(data.merge_tags) ? data.merge_tags : []
    } as EmailTemplate;
  },

  updateTemplate: async (id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      merge_tags: Array.isArray(data.merge_tags) ? data.merge_tags : []
    } as EmailTemplate;
  },

  // Recipient Management
  getCampaignRecipients: async (campaignId: string): Promise<CampaignRecipient[]> => {
    const { data, error } = await supabase
      .from('campaign_recipients')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  addCampaignRecipients: async (campaignId: string, recipients: { email: string; lead_id?: string }[]): Promise<void> => {
    const recipientData = recipients.map(recipient => ({
      campaign_id: campaignId,
      email: recipient.email,
      lead_id: recipient.lead_id,
      status: 'pending' as const
    }));

    const { error } = await supabase
      .from('campaign_recipients')
      .insert(recipientData);
    
    if (error) throw error;
  },

  // Analytics
  getCampaignMetrics: async (campaignId: string): Promise<CampaignMetrics> => {
    const { data, error } = await supabase
      .rpc('calculate_campaign_metrics', { campaign_uuid: campaignId });
    
    if (error) throw error;
    return data[0] || {
      total_recipients: 0,
      delivered_count: 0,
      opened_count: 0,
      clicked_count: 0,
      bounced_count: 0,
      unsubscribed_count: 0,
      open_rate: 0,
      click_rate: 0,
      bounce_rate: 0
    };
  },

  // Email Delivery
  sendCampaign: async (campaignId: string): Promise<void> => {
    const { error } = await supabase.functions.invoke('send-email-campaign', {
      body: { campaignId }
    });
    
    if (error) throw error;
  },

  scheduleCampaign: async (campaignId: string, sendAt: string): Promise<void> => {
    await emailCampaignService.updateCampaign(campaignId, {
      status: 'scheduled',
      send_at: sendAt
    });
  }
};
