import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Mail, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import EmailCampaignList from '@/components/emails/EmailCampaignList';
import EmailCampaignForm from '@/components/emails/EmailCampaignForm';
import EmailTemplateList from '@/components/emails/EmailTemplateList';
import EmailTemplateForm from '@/components/emails/EmailTemplateForm';
import { useEmailCampaigns } from '@/hooks/emails/useEmailCampaigns';
import { useEmailTemplates } from '@/hooks/emails/useEmailTemplates';
// Metrics for campaign analytics are fetched from Supabase via RPC
import { EmailCampaign, EmailTemplate, CampaignMetrics } from '@/types/email-types';
import { toast } from 'sonner';

const EmailCampaigns = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isCampaignFormOpen, setIsCampaignFormOpen] = useState(false);
  const [isTemplateFormOpen, setIsTemplateFormOpen] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState<EmailCampaign | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  
  const {
    campaigns,
    createCampaign,
    updateCampaign,
    getCampaignMetrics
  } = useEmailCampaigns();
  const { createTemplate, updateTemplate } = useEmailTemplates();

  // Campaign handlers
  const handleCreateCampaign = () => {
    setCurrentCampaign(null);
    setIsCampaignFormOpen(true);
  };

  const handleEditCampaign = (campaign: EmailCampaign) => {
    setCurrentCampaign(campaign);
    setIsCampaignFormOpen(true);
  };

  const handleViewCampaign = (campaign: EmailCampaign) => {
    setSelectedCampaignId(campaign.id);
    setActiveTab('analytics');
  };

  const handleSendCampaign = (campaign: EmailCampaign) => {
    toast.success(`Campaign '${campaign.name}' will be sent to ${campaign.recipient_count} recipients.`);
  };

  const handlePauseCampaign = (campaign: EmailCampaign) => {
    toast.success(`Campaign '${campaign.name}' has been paused.`);
  };

  const handleSaveCampaign = async (data: Partial<EmailCampaign>, selectedLeadIds: string[]) => {
    try {
      const campaignData = {
        ...data,
        recipient_count: selectedLeadIds.length,
        open_count: 0,
        click_count: 0
      };

      if (data.id) {
        await updateCampaign({ id: data.id, data: campaignData });
        toast.success('Campaign updated successfully');
      } else {
        await createCampaign(campaignData);
        toast.success('Campaign created successfully');
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Failed to save campaign');
    }
  };

  // Template handlers
  const handleCreateTemplate = () => {
    setCurrentTemplate(null);
    setIsTemplateFormOpen(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setCurrentTemplate(template);
    setIsTemplateFormOpen(true);
  };

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    const duplicatedTemplate = { 
      ...template,
      id: undefined, 
      name: `${template.name} (Copy)` 
    };
    setCurrentTemplate(duplicatedTemplate as EmailTemplate);
    setIsTemplateFormOpen(true);
  };

  const handleSaveTemplate = async (data: Partial<EmailTemplate>) => {
    try {
      if (data.id) {
        await updateTemplate({ id: data.id, data });
      } else {
        await createTemplate(data);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  // Load metrics when analytics tab is active
  useEffect(() => {
    if (activeTab === 'analytics' && campaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [activeTab, campaigns, selectedCampaignId]);

  useEffect(() => {
    if (!selectedCampaignId) return;
    setLoadingMetrics(true);
    getCampaignMetrics(selectedCampaignId)
      .then((data) => setMetrics(data))
      .finally(() => setLoadingMetrics(false));
  }, [selectedCampaignId, getCampaignMetrics]);

  const renderActionButton = () => {
    if (activeTab === 'campaigns') {
      return (
        <Button onClick={handleCreateCampaign}>
          <Plus className="mr-2 h-4 w-4" /> Create Campaign
        </Button>
      );
    } else if (activeTab === 'templates') {
      return (
        <Button onClick={handleCreateTemplate}>
          <Plus className="mr-2 h-4 w-4" /> Create Template
        </Button>
      );
    }
    return null;
  };

  return (
    <PageTemplate 
      title="Email Campaigns" 
      icon={<Mail className="h-8 w-8" />}
      description="Create and manage email campaigns to leads and clients."
      actions={renderActionButton()}
    >
      <Tabs defaultValue="campaigns" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="analytics">Campaign Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="campaigns" className="space-y-6">
          <EmailCampaignList 
            onEdit={handleEditCampaign}
            onView={handleViewCampaign}
            onDelete={() => {}}
            onSend={handleSendCampaign}
            onPause={handlePauseCampaign}
          />
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-6">
          <EmailTemplateList
            onEdit={handleEditTemplate}
            onDuplicate={handleDuplicateTemplate}
            onDelete={() => {}}
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          {campaigns.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-muted-foreground">No campaigns found.</p>
            </div>
          ) : (
            <>
              <Select
                value={selectedCampaignId || undefined}
                onValueChange={setSelectedCampaignId}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {loadingMetrics || !metrics ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Recipients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.total_recipients}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Open Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.open_rate}%</div>
                      <p className="text-xs text-muted-foreground">{metrics.open_count} opens</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Click Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.click_rate}%</div>
                      <p className="text-xs text-muted-foreground">{metrics.click_count} clicks</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Bounce Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.bounce_rate}%</div>
                      <p className="text-xs text-muted-foreground">{metrics.bounce_count} bounces</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
      
      {isCampaignFormOpen && (
        <EmailCampaignForm 
          isOpen={isCampaignFormOpen}
          onClose={() => setIsCampaignFormOpen(false)}
          onSave={handleSaveCampaign}
          campaign={currentCampaign || undefined}
        />
      )}

      {isTemplateFormOpen && (
        <EmailTemplateForm
          isOpen={isTemplateFormOpen}
          onClose={() => setIsTemplateFormOpen(false)}
          onSave={handleSaveTemplate}
          template={currentTemplate || undefined}
        />
      )}
    </PageTemplate>
  );
};

export default EmailCampaigns;
