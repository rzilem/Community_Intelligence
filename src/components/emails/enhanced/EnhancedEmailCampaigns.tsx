
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BarChart3 } from 'lucide-react';
import { useCampaignManagement } from '@/hooks/emails/useCampaignManagement';
import { useCampaignFilters } from '@/hooks/emails/useCampaignFilters';
import { CampaignBuilder } from './CampaignBuilder';
import { CampaignAnalytics } from './CampaignAnalytics';
import CampaignFilters from './campaign-list/CampaignFilters';
import CampaignsList from './campaign-list/CampaignsList';

export const EnhancedEmailCampaigns: React.FC = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showBuilder, setShowBuilder] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const {
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
    isProcessing
  } = useCampaignManagement();

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredCampaigns,
    campaignCounts
  } = useCampaignFilters(campaigns);

  const handleCreateNew = () => {
    setSelectedCampaign(null);
    setIsCreating(true);
    setShowBuilder(true);
  };

  const handleEdit = (campaign: any) => {
    setSelectedCampaign(campaign);
    setIsEditing(true);
    setShowBuilder(true);
  };

  const handleViewAnalytics = (campaign: any) => {
    setSelectedCampaign(campaign);
    setShowAnalytics(true);
  };

  const handleBuilderSave = async (data: any) => {
    if (isEditing && selectedCampaign) {
      await handleUpdateCampaign(selectedCampaign.id, data);
    } else {
      await handleCreateCampaign(data);
    }
    setShowBuilder(false);
    setIsCreating(false);
    setIsEditing(false);
  };

  if (showBuilder) {
    return (
      <CampaignBuilder
        campaign={selectedCampaign}
        templates={[]}
        onSave={handleBuilderSave}
        onSend={handleSendCampaign}
        onSchedule={handleScheduleCampaign}
      />
    );
  }

  if (showAnalytics && selectedCampaign) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Campaign Analytics</h2>
          <Button variant="outline" onClick={() => setShowAnalytics(false)}>
            Back to Campaigns
          </Button>
        </div>
        <CampaignAnalytics
          campaign={selectedCampaign}
          metrics={{
            total_recipients: selectedCampaign.recipient_count || 0,
            delivered_count: 0,
            opened_count: 0,
            clicked_count: 0,
            bounced_count: 0,
            unsubscribed_count: 0,
            open_rate: 0,
            click_rate: 0,
            bounce_rate: 0
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Campaigns</h1>
          <p className="text-muted-foreground">Create and manage your email marketing campaigns</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns">
            Campaigns ({campaignCounts.total})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <CampaignFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />

          <CampaignsList
            campaigns={filteredCampaigns}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDeleteCampaign}
            onSend={handleSendCampaign}
            onSchedule={(campaign) => console.log('Schedule:', campaign)}
            onViewAnalytics={handleViewAnalytics}
            onCreateNew={handleCreateNew}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Overall Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Select a sent campaign to view detailed analytics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
