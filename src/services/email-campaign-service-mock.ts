import { EmailCampaign, EmailTemplate, CampaignRecipient, CampaignMetrics } from '@/types/email-campaign-types';

// Mock data
const mockCampaigns: EmailCampaign[] = [
  {
    id: 'campaign-1',
    name: 'Welcome Campaign',
    subject: 'Welcome to our community!',
    body: 'Thank you for joining our community.',
    status: 'sent',
    template_id: 'template-1',
    send_at: '2024-01-15T10:00:00Z',
    completed_at: '2024-01-15T10:30:00Z',
    created_by: 'user-1',
    target_audience: { type: 'all' },
    campaign_settings: { tracking: true },
    delivery_count: 150,
    recipient_count: 150,
    open_count: 45,
    click_count: 12,
    open_rate: 30,
    click_rate: 8,
    bounce_rate: 2,
    unsubscribe_count: 1,
    scheduled_date: '2024-01-15T10:00:00Z',
    sent_date: '2024-01-15T10:05:00Z',
    created_at: '2024-01-14T15:00:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  }
];

const mockTemplates: EmailTemplate[] = [
  {
    id: 'template-1',
    name: 'Welcome Template',
    subject: 'Welcome {{name}}!',
    body: 'Hello {{name}}, welcome to our community!',
    category: 'welcome',
    description: 'Standard welcome message',
    preview_text: 'Welcome to our amazing community',
    merge_tags: ['name', 'email'],
    is_active: true,
    created_by: 'user-1',
    version: 1,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  }
];

const mockRecipients: CampaignRecipient[] = [
  {
    id: 'recipient-1',
    campaign_id: 'campaign-1',
    lead_id: 'lead-1',
    email: 'john@example.com',
    status: 'opened',
    delivery_attempts: 1,
    last_delivery_attempt: '2024-01-15T10:05:00Z',
    metadata: { name: 'John Doe' },
    sent_date: '2024-01-15T10:05:00Z',
    opened_date: '2024-01-15T11:30:00Z',
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T11:30:00Z'
  }
];

export const emailCampaignService = {
  // Campaign Management
  getCampaigns: async (): Promise<EmailCampaign[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return [...mockCampaigns];
  },

  getCampaignById: async (id: string): Promise<EmailCampaign | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockCampaigns.find(c => c.id === id) || null;
  },

  createCampaign: async (campaign: Partial<EmailCampaign>): Promise<EmailCampaign> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newCampaign: EmailCampaign = {
      id: `campaign-${Date.now()}`,
      name: campaign.name || 'New Campaign',
      subject: campaign.subject || '',
      body: campaign.body || '',
      status: campaign.status || 'draft',
      template_id: campaign.template_id,
      send_at: campaign.send_at,
      created_by: 'current-user',
      target_audience: campaign.target_audience || {},
      campaign_settings: campaign.campaign_settings || {},
      delivery_count: 0,
      recipient_count: 0,
      open_count: 0,
      click_count: 0,
      open_rate: 0,
      click_rate: 0,
      bounce_rate: 0,
      unsubscribe_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockCampaigns.push(newCampaign);
    return newCampaign;
  },

  updateCampaign: async (id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Campaign not found');
    
    mockCampaigns[index] = {
      ...mockCampaigns[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return mockCampaigns[index];
  },

  deleteCampaign: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index !== -1) {
      mockCampaigns.splice(index, 1);
    }
  },

  // Template Management
  getTemplates: async (): Promise<EmailTemplate[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...mockTemplates];
  },

  createTemplate: async (template: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newTemplate: EmailTemplate = {
      id: `template-${Date.now()}`,
      name: template.name || 'New Template',
      subject: template.subject || '',
      body: template.body || '',
      category: template.category || 'custom',
      description: template.description,
      preview_text: template.preview_text,
      merge_tags: template.merge_tags || [],
      is_active: true,
      created_by: 'current-user',
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockTemplates.push(newTemplate);
    return newTemplate;
  },

  updateTemplate: async (id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockTemplates.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Template not found');
    
    mockTemplates[index] = {
      ...mockTemplates[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return mockTemplates[index];
  },

  // Recipient Management
  getCampaignRecipients: async (campaignId: string): Promise<CampaignRecipient[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockRecipients.filter(r => r.campaign_id === campaignId);
  },

  addCampaignRecipients: async (campaignId: string, recipients: { email: string; lead_id?: string }[]): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newRecipients = recipients.map(recipient => ({
      id: `recipient-${Date.now()}-${Math.random()}`,
      campaign_id: campaignId,
      email: recipient.email,
      lead_id: recipient.lead_id,
      status: 'pending' as const,
      delivery_attempts: 0,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    mockRecipients.push(...newRecipients);
  },

  // Analytics
  getCampaignMetrics: async (campaignId: string): Promise<CampaignMetrics> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    if (!campaign) {
      return {
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
    }

    return {
      total_recipients: campaign.recipient_count,
      delivered_count: campaign.delivery_count,
      opened_count: campaign.open_count,
      clicked_count: campaign.click_count,
      bounced_count: Math.floor(campaign.recipient_count * (campaign.bounce_rate / 100)),
      unsubscribed_count: campaign.unsubscribe_count,
      open_rate: campaign.open_rate,
      click_rate: campaign.click_rate,
      bounce_rate: campaign.bounce_rate
    };
  },

  // Email Delivery
  sendCampaign: async (campaignId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.status = 'sending';
      campaign.sent_date = new Date().toISOString();
      campaign.updated_at = new Date().toISOString();
      
      // Simulate completion after a delay
      setTimeout(() => {
        campaign.status = 'sent';
        campaign.completed_at = new Date().toISOString();
        campaign.updated_at = new Date().toISOString();
      }, 2000);
    }
  },

  scheduleCampaign: async (campaignId: string, sendAt: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.status = 'scheduled';
      campaign.send_at = sendAt;
      campaign.updated_at = new Date().toISOString();
    }
  }
};