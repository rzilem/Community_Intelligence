
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Mail, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import EmailCampaignList from '@/components/emails/EmailCampaignList';
import EmailCampaignForm from '@/components/emails/EmailCampaignForm';
import { useEmailCampaigns } from '@/hooks/emails/useEmailCampaigns';
import { EmailCampaign } from '@/types/email-types';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

const EmailCampaigns = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState<EmailCampaign | null>(null);
  
  const { createCampaign, updateCampaign } = useEmailCampaigns();

  const handleCreateCampaign = () => {
    setCurrentCampaign(null);
    setIsFormOpen(true);
  };

  const handleEditCampaign = (campaign: EmailCampaign) => {
    setCurrentCampaign(campaign);
    setIsFormOpen(true);
  };

  const handleViewCampaign = (campaign: EmailCampaign) => {
    toast.info('Campaign analytics coming soon!');
  };

  const handleDeleteCampaign = (campaignId: string) => {
    // Delete is handled in the EmailCampaignList component
  };

  const handleSendCampaign = (campaign: EmailCampaign) => {
    toast.success(`Campaign '${campaign.name}' will be sent to ${campaign.recipient_count} recipients.`);
    // In a real implementation, this would update the campaign status and send emails
  };

  const handlePauseCampaign = (campaign: EmailCampaign) => {
    toast.success(`Campaign '${campaign.name}' has been paused.`);
    // In a real implementation, this would update the campaign status
  };

  const handleSaveCampaign = async (data: Partial<EmailCampaign>, selectedLeadIds: string[]) => {
    try {
      // In a real implementation, we'd save the campaign and then associate leads
      const campaignData = {
        ...data,
        recipient_count: selectedLeadIds.length,
        open_count: 0,
        click_count: 0
      };

      if (data.id) {
        // Update existing campaign
        await updateCampaign({ id: data.id, data: campaignData });
        toast.success('Campaign updated successfully');
      } else {
        // Create new campaign
        await createCampaign(campaignData);
        toast.success('Campaign created successfully');
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Failed to save campaign');
    }
  };

  return (
    <PageTemplate 
      title="Email Campaigns" 
      icon={<Mail className="h-8 w-8" />}
      description="Create and manage email campaigns to leads and clients."
      actions={
        <Button onClick={handleCreateCampaign}>
          <Plus className="mr-2 h-4 w-4" /> Create Campaign
        </Button>
      }
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
            onDelete={handleDeleteCampaign}
            onSend={handleSendCampaign}
            onPause={handlePauseCampaign}
          />
        </TabsContent>
        
        <TabsContent value="templates">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <p className="text-muted-foreground">Email template management coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <p className="text-muted-foreground">Email campaign analytics coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {isFormOpen && (
        <EmailCampaignForm 
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveCampaign}
          campaign={currentCampaign || undefined}
        />
      )}
    </PageTemplate>
  );
};

export default EmailCampaigns;
