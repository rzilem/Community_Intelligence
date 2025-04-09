
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Mail, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import EmailCampaignList from '@/components/emails/EmailCampaignList';
import EmailCampaignForm from '@/components/emails/EmailCampaignForm';
import EmailTemplateList from '@/components/emails/EmailTemplateList';
import EmailTemplateForm from '@/components/emails/EmailTemplateForm';
import { useEmailCampaigns } from '@/hooks/emails/useEmailCampaigns';
import { useEmailTemplates } from '@/hooks/emails/useEmailTemplates';
import { EmailCampaign, EmailTemplate } from '@/types/email-types';
import { toast } from 'sonner';

const EmailCampaigns = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isCampaignFormOpen, setIsCampaignFormOpen] = useState(false);
  const [isTemplateFormOpen, setIsTemplateFormOpen] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState<EmailCampaign | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  
  const { createCampaign, updateCampaign } = useEmailCampaigns();
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
    toast.info('Campaign analytics coming soon!');
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
        
        <TabsContent value="analytics">
          <div className="text-center py-10 border rounded-lg">
            <p className="text-muted-foreground">Email campaign analytics coming soon...</p>
          </div>
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
