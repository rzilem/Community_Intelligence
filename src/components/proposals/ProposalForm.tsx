
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Proposal, ProposalTemplate, ProposalAttachment } from '@/types/proposal-types';
import { Lead } from '@/types/lead-types';
import { useLeads } from '@/hooks/leads/useLeads';
import { useProposalTemplates } from '@/hooks/proposals/useProposalTemplates';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Upload, FileText, Image, Video, File, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface ProposalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Proposal>) => Promise<void>;
  proposal?: Proposal;
  leadId?: string;
}

const ProposalForm: React.FC<ProposalFormProps> = ({
  isOpen,
  onClose,
  onSave,
  proposal,
  leadId
}) => {
  const { leads } = useLeads();
  const { templates, isLoading: templatesLoading } = useProposalTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [attachments, setAttachments] = useState<ProposalAttachment[]>(proposal?.attachments || []);
  const [activeTab, setActiveTab] = useState("content");

  const form = useForm({
    defaultValues: {
      id: proposal?.id || '',
      lead_id: proposal?.lead_id || leadId || '',
      template_id: proposal?.template_id || '',
      name: proposal?.name || '',
      content: proposal?.content || '',
      amount: proposal?.amount || 0,
      status: proposal?.status || 'draft'
    }
  });

  // Effect to apply template content when selected
  useEffect(() => {
    if (selectedTemplate) {
      form.setValue('content', selectedTemplate.content);
      form.setValue('template_id', selectedTemplate.id);
    }
  }, [selectedTemplate, form]);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
  };

  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      const proposalData = {
        ...data,
        attachments: attachments
      };
      await onSave(proposalData);
      onClose();
    } catch (error) {
      console.error('Error saving proposal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // For demo purposes, we'll create fake attachments
    const newAttachments: ProposalAttachment[] = Array.from(files).map((file, index) => {
      const fileType = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
        ? 'video'
        : file.type === 'application/pdf'
        ? 'pdf'
        : file.type.includes('document')
        ? 'document'
        : 'other';
      
      return {
        id: `temp-${Date.now()}-${index}`,
        name: file.name,
        type: fileType,
        url: URL.createObjectURL(file),
        size: file.size,
        content_type: file.type,
        created_at: new Date().toISOString()
      };
    });
    
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{proposal ? 'Edit Proposal' : 'Create New Proposal'}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <TabsContent value="content" className="mt-0">
                {!leadId && (
                  <FormField
                    control={form.control}
                    name="lead_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lead</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a lead" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {leads.map((lead: Lead) => (
                              <SelectItem key={lead.id} value={lead.id}>
                                {lead.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proposal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter proposal name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="template_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template</FormLabel>
                      {templatesLoading ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleTemplateChange(value);
                            }} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a template" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {templates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Selecting a template will replace the current content.
                          </FormDescription>
                        </>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter proposal content"
                          className="min-h-[200px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="attachments" className="mt-0">
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Drag and drop files here, or</p>
                    <label htmlFor="file-upload" className="mt-2">
                      <Button variant="outline" type="button" className="relative">
                        Browse files
                        <input 
                          id="file-upload" 
                          type="file" 
                          multiple 
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4,.mov" 
                          className="sr-only"
                          onChange={handleFileUpload}
                        />
                      </Button>
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      Supported formats: PDF, Word, Images, Videos
                    </p>
                  </div>
                  
                  {attachments.length > 0 && (
                    <div className="border rounded-md p-3">
                      <h3 className="text-sm font-medium mb-2">Uploaded files</h3>
                      <div className="space-y-2">
                        {attachments.map(attachment => (
                          <div 
                            key={attachment.id}
                            className="flex items-center justify-between bg-gray-50 rounded-md p-2 text-sm"
                          >
                            <div className="flex items-center">
                              {attachment.type === 'pdf' && <FileText className="h-4 w-4 mr-2 text-red-500" />}
                              {attachment.type === 'image' && <Image className="h-4 w-4 mr-2 text-blue-500" />}
                              {attachment.type === 'video' && <Video className="h-4 w-4 mr-2 text-purple-500" />}
                              {(attachment.type === 'document' || attachment.type === 'other') && 
                                <File className="h-4 w-4 mr-2 text-gray-500" />
                              }
                              {attachment.name}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeAttachment(attachment.id)}
                              type="button"
                            >
                              <X className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="mt-0">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {proposal ? 'Save Changes' : 'Create Proposal'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalForm;
