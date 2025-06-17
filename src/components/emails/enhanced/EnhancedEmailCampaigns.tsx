
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailCampaign, EmailTemplate } from '@/types/email-campaign-types';
import { CampaignBuilder } from './CampaignBuilder';
import { CampaignAnalytics } from './CampaignAnalytics';
import { TemplateManager } from './TemplateManager';
import { useEmailCampaigns } from '@/hooks/emails/useEmailCampaigns';
import { useEmailTemplates } from '@/hooks/emails/useEmailTemplates';
import { emailCampaignService } from '@/services/email-campaign-service';
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  Play,
  Pause,
  BarChart3,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

export const EnhancedEmailCampaigns: React.FC = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { campaigns, isLoading: campaignsLoading, refetch: refetchCampaigns } = useEmailCampaigns();
  const { templates, isLoading: templatesLoading } = useEmailTemplates();

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateCampaign = () => {
    setSelectedCampaign(null);
    setShowBuilder(true);
  };

  const handleEditCampaign = (campaign: EmailCampaign) => {
    setSelectedCampaign(campaign);
    setShowBuilder(true);
  };

  const handleSaveCampaign = async (campaignData: Partial<EmailCampaign>) => {
    try {
      if (selectedCampaign) {
        await emailCampaignService.updateCampaign(selectedCampaign.id, campaignData);
        toast.success('Campaign updated successfully');
      } else {
        await emailCampaignService.createCampaign(campaignData);
        toast.success('Campaign created successfully');
      }
      refetchCampaigns();
      setShowBuilder(false);
    } catch (error) {
      toast.error('Failed to save campaign');
      console.error('Error saving campaign:', error);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      await emailCampaignService.sendCampaign(campaignId);
      toast.success('Campaign sent successfully');
      refetchCampaigns();
    } catch (error) {
      toast.error('Failed to send campaign');
      console.error('Error sending campaign:', error);
    }
  };

  const handleScheduleCampaign = async (campaignId: string, sendAt: string) => {
    try {
      await emailCampaignService.scheduleCampaign(campaignId, sendAt);
      toast.success('Campaign scheduled successfully');
      refetchCampaigns();
    } catch (error) {
      toast.error('Failed to schedule campaign');
      console.error('Error scheduling campaign:', error);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await emailCampaignService.deleteCampaign(campaignId);
        toast.success('Campaign deleted successfully');
        refetchCampaigns();
      } catch (error) {
        toast.error('Failed to delete campaign');
        console.error('Error deleting campaign:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'sending': return 'bg-yellow-500';
      case 'draft': return 'bg-gray-500';
      case 'paused': return 'bg-orange-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (showBuilder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowBuilder(false)}>
            ← Back to Campaigns
          </Button>
        </div>
        <CampaignBuilder
          campaign={selectedCampaign || undefined}
          templates={templates}
          onSave={handleSaveCampaign}
          onSend={handleSendCampaign}
          onSchedule={handleScheduleCampaign}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Campaigns</h1>
          <p className="text-muted-foreground">
            Create, manage, and track your email marketing campaigns
          </p>
        </div>
        <Button onClick={handleCreateCampaign}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sending">Sending</option>
                  <option value="sent">Sent</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns List */}
          <div className="grid gap-4">
            {campaignsLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">Loading campaigns...</div>
                </CardContent>
              </Card>
            ) : filteredCampaigns.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
                    <p className="text-muted-foreground mb-4">
                      Get started by creating your first email campaign
                    </p>
                    <Button onClick={handleCreateCampaign}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Campaign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredCampaigns.map(campaign => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{campaign.name}</h3>
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">{campaign.subject}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{campaign.recipient_count} recipients</span>
                          <span>{campaign.open_rate.toFixed(1)}% open rate</span>
                          <span>{campaign.click_rate.toFixed(1)}% click rate</span>
                          {campaign.created_at && (
                            <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCampaign(campaign)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCampaign(campaign)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <TemplateManager />
        </TabsContent>

        <TabsContent value="analytics">
          {selectedCampaign ? (
            <CampaignAnalytics 
              campaign={selectedCampaign}
              metrics={{
                total_recipients: selectedCampaign.recipient_count,
                delivered_count: selectedCampaign.delivery_count,
                opened_count: selectedCampaign.open_count,
                clicked_count: selectedCampaign.click_count,
                bounced_count: 0,
                unsubscribed_count: selectedCampaign.unsubscribe_count,
                open_rate: selectedCampaign.open_rate,
                click_rate: selectedCampaign.click_rate,
                bounce_rate: selectedCampaign.bounce_rate
              }}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Select a Campaign</h3>
                  <p className="text-muted-foreground">
                    Choose a campaign from the campaigns tab to view its analytics
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Email Automation</h3>
                <p className="text-muted-foreground mb-4">
                  Set up automated email sequences and drip campaigns
                </p>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Automation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
