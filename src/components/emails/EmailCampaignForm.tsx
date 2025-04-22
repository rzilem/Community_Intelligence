
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { EmailCampaign, EmailTemplate } from '@/types/email-types';
import { useEmailTemplates } from '@/hooks/emails/useEmailTemplates';
import { useLeads } from '@/hooks/leads/useLeads';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { LeadStatus } from '@/types/lead-types';

interface EmailCampaignFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<EmailCampaign>, selectedLeadIds: string[]) => Promise<void>;
  campaign?: EmailCampaign;
}

const EmailCampaignForm: React.FC<EmailCampaignFormProps> = ({
  isOpen,
  onClose,
  onSave,
  campaign
}) => {
  const { leads } = useLeads();
  const { templates, isLoading: templatesLoading } = useEmailTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');

  const form = useForm({
    defaultValues: {
      id: campaign?.id || '',
      name: campaign?.name || '',
      subject: campaign?.subject || '',
      body: campaign?.body || '',
      status: campaign?.status || 'draft',
    }
  });

  // Effect to apply template content when selected
  useEffect(() => {
    if (selectedTemplate) {
      form.setValue('subject', selectedTemplate.subject);
      form.setValue('body', selectedTemplate.body);
    }
  }, [selectedTemplate, form]);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
  };

  // Filter leads based on status
  const filteredLeads = filterStatus === 'all' 
    ? leads 
    : leads.filter(lead => lead.status === filterStatus);

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId) 
        : [...prev, leadId]
    );
  };

  const selectAllLeads = () => {
    setSelectedLeadIds(filteredLeads.map(lead => lead.id));
  };

  const deselectAllLeads = () => {
    setSelectedLeadIds([]);
  };

  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      await onSave(data, selectedLeadIds);
      onClose();
    } catch (error) {
      console.error('Error saving campaign:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{campaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter campaign name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email subject" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Email Template</FormLabel>
              {templatesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select 
                  onValueChange={(value) => handleTemplateChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-muted-foreground">
                Selecting a template will replace the current subject and body.
              </p>
            </div>

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter email content"
                      className="min-h-[200px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    You can use HTML tags to format your email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Recipients ({selectedLeadIds.length} selected)</FormLabel>
                <div className="flex gap-2">
                  <Select 
                    defaultValue="all"
                    onValueChange={(value: any) => setFilterStatus(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Leads</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={selectAllLeads}
                  >
                    Select All
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={deselectAllLeads}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto">
                {filteredLeads.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No leads found matching your filter.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {filteredLeads.map(lead => (
                      <div key={lead.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={lead.id} 
                          checked={selectedLeadIds.includes(lead.id)} 
                          onCheckedChange={() => toggleLeadSelection(lead.id)}
                        />
                        <label 
                          htmlFor={lead.id} 
                          className="text-sm cursor-pointer"
                        >
                          {lead.name} ({lead.email})
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving || selectedLeadIds.length === 0}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {campaign ? 'Save Changes' : 'Create Campaign'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailCampaignForm;
