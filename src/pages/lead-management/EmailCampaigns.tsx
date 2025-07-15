
import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import AppLayout from '@/components/layout/AppLayout';
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
import { useEmailCampaigns } from '@/hooks/emails/useEmailCampaigns';
import { useEmailTemplates } from '@/hooks/emails/useEmailTemplates';
import { toast } from 'sonner';

// Simple mock data for now to prevent errors
const mockCampaigns = [
  {
    id: '1',
    name: 'Welcome Campaign',
    recipient_count: 25,
    open_count: 15,
    click_count: 8,
    status: 'active' as const
  }
];

const mockTemplates = [
  {
    id: '1',
    name: 'Welcome Template',
    subject: 'Welcome to our community',
    content: 'Welcome message content'
  }
];

const EmailCampaigns = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Mock metrics data
  const metrics = {
    total_recipients: 25,
    open_rate: 60,
    open_count: 15,
    click_rate: 32,
    click_count: 8,
    bounce_rate: 4,
    bounce_count: 1
  };

  const renderActionButton = () => {
    if (activeTab === 'campaigns') {
      return (
        <Button onClick={() => toast.success('Create campaign functionality coming soon')}>
          <Plus className="mr-2 h-4 w-4" /> Create Campaign
        </Button>
      );
    } else if (activeTab === 'templates') {
      return (
        <Button onClick={() => toast.success('Create template functionality coming soon')}>
          <Plus className="mr-2 h-4 w-4" /> Create Template
        </Button>
      );
    }
    return null;
  };

  return (
    <AppLayout>
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
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Campaign List</h3>
              {mockCampaigns.length === 0 ? (
                <div className="text-center py-10 border rounded-lg">
                  <p className="text-muted-foreground">No campaigns found.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {mockCampaigns.map((campaign) => (
                    <Card key={campaign.id}>
                      <CardHeader>
                        <CardTitle>{campaign.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Recipients: {campaign.recipient_count}</p>
                        <p>Opens: {campaign.open_count}</p>
                        <p>Clicks: {campaign.click_count}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Template List</h3>
              {mockTemplates.length === 0 ? (
                <div className="text-center py-10 border rounded-lg">
                  <p className="text-muted-foreground">No templates found.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {mockTemplates.map((template) => (
                    <Card key={template.id}>
                      <CardHeader>
                        <CardTitle>{template.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Subject: {template.subject}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <div className="space-y-4">
              <Select
                value={selectedCampaignId || undefined}
                onValueChange={setSelectedCampaignId}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  {mockCampaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
            </div>
          </TabsContent>
        </Tabs>
      </PageTemplate>
    </AppLayout>
  );
};

export default EmailCampaigns;
