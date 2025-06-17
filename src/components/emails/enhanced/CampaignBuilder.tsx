
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailTemplate, EmailCampaign } from '@/types/email-campaign-types';
import { RichTextEditor } from './RichTextEditor';
import { RecipientSelector } from './RecipientSelector';
import { CampaignPreview } from './CampaignPreview';
import { Send, Save, Calendar, Users, FileText } from 'lucide-react';

interface CampaignBuilderProps {
  campaign?: EmailCampaign;
  templates: EmailTemplate[];
  onSave: (campaign: Partial<EmailCampaign>) => void;
  onSend: (campaignId: string) => void;
  onSchedule: (campaignId: string, sendAt: string) => void;
}

export const CampaignBuilder: React.FC<CampaignBuilderProps> = ({
  campaign,
  templates,
  onSave,
  onSend,
  onSchedule
}) => {
  const [currentTab, setCurrentTab] = useState('content');
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    subject: campaign?.subject || '',
    body: campaign?.body || '',
    template_id: campaign?.template_id || '',
    target_audience: campaign?.target_audience || {},
    campaign_settings: campaign?.campaign_settings || {}
  });
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        template_id: templateId,
        subject: template.subject,
        body: template.body
      }));
    }
  };

  const handleSave = () => {
    onSave({
      ...formData,
      target_audience: { recipients: selectedRecipients },
      recipient_count: selectedRecipients.length
    });
  };

  const handleSend = () => {
    if (campaign?.id) {
      onSend(campaign.id);
    }
  };

  const handleSchedule = () => {
    if (campaign?.id && scheduleDate) {
      onSchedule(campaign.id, scheduleDate);
    }
  };

  const canSend = campaign?.id && selectedRecipients.length > 0 && formData.subject && formData.body;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {campaign ? 'Edit Campaign' : 'Create New Campaign'}
          </h2>
          <p className="text-muted-foreground">
            Build and send targeted email campaigns to your leads
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          {canSend && (
            <>
              <Button variant="outline" onClick={handleSchedule}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
              <Button onClick={handleSend}>
                <Send className="h-4 w-4 mr-2" />
                Send Now
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="recipients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Recipients ({selectedRecipients.length})
          </TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Enter campaign name"
                  />
                </div>
                <div>
                  <Label htmlFor="template">Use Template</Label>
                  <Select value={formData.template_id} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{template.category}</Badge>
                            {template.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleFieldChange('subject', e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <Label htmlFor="body">Email Content</Label>
                <RichTextEditor
                  value={formData.body}
                  onChange={(value) => handleFieldChange('body', value)}
                  placeholder="Write your email content here..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipients">
          <RecipientSelector
            selectedRecipients={selectedRecipients}
            onRecipientsChange={setSelectedRecipients}
          />
        </TabsContent>

        <TabsContent value="preview">
          <CampaignPreview
            subject={formData.subject}
            body={formData.body}
            recipientCount={selectedRecipients.length}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="schedule">Schedule Send Time</Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              
              <div>
                <Label>Tracking Settings</Label>
                <div className="space-y-2 mt-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span>Track email opens</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span>Track link clicks</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span>Track unsubscribes</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
