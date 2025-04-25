
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Proposal, ProposalTemplate, ProposalAttachment, ProposalSection } from '@/types/proposal-types';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import ProposalContentForm from './ProposalContentForm';
import ProposalAttachments from './ProposalAttachments';
import ProposalSettingsForm from './ProposalSettingsForm';
import ProposalBuilder from './interactive-builder/ProposalBuilder';

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
  const [useAdvancedEditor, setUseAdvancedEditor] = useState(false);
  const [sections, setSections] = useState<ProposalSection[]>(proposal?.sections || []);

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
      
      // If we're using the advanced editor, try to parse the template content into sections
      if (useAdvancedEditor) {
        try {
          // This is simplified, in a real app you'd need a more robust parser
          const parser = new DOMParser();
          const doc = parser.parseFromString(selectedTemplate.content, 'text/html');
          const sectionElements = doc.querySelectorAll('section[data-section-id]');
          
          if (sectionElements.length > 0) {
            const parsedSections: ProposalSection[] = Array.from(sectionElements).map((el, index) => {
              const id = el.getAttribute('data-section-id') || `section-${Date.now()}-${index}`;
              const title = el.querySelector('h2')?.textContent || 'Untitled Section';
              const content = el.innerHTML;
              
              return {
                id,
                title,
                content,
                order: index,
                attachments: []
              };
            });
            
            setSections(parsedSections);
          }
        } catch (error) {
          console.error('Error parsing template content:', error);
        }
      }
    }
  }, [selectedTemplate, form, useAdvancedEditor]);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
  };

  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      const proposalData = {
        ...data,
        attachments: attachments,
        sections: sections
      };
      await onSave(proposalData);
      onClose();
    } catch (error) {
      console.error('Error saving proposal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAttachmentUpload = (attachment: ProposalAttachment) => {
    setAttachments(prev => [...prev, attachment]);
  };

  const handleAttachmentRemove = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleAdvancedContentSave = (content: string, updatedSections: ProposalSection[]) => {
    form.setValue('content', content);
    setSections(updatedSections);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{proposal ? 'Edit Proposal' : 'Create New Proposal'}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <TabsContent value="content" className="mt-0 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Proposal Content</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUseAdvancedEditor(!useAdvancedEditor)}
                  >
                    {useAdvancedEditor ? 'Switch to Basic Editor' : 'Switch to Advanced Editor'}
                  </Button>
                </div>
                
                {useAdvancedEditor ? (
                  <div className="border rounded-md">
                    <ProposalBuilder
                      initialContent={form.getValues('content')}
                      onSave={handleAdvancedContentSave}
                      proposalId={proposal?.id}
                    />
                  </div>
                ) : (
                  <ProposalContentForm 
                    leads={leads}
                    templates={templates}
                    templatesLoading={templatesLoading}
                    onTemplateChange={handleTemplateChange}
                    showLeadSelector={!leadId}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="attachments" className="mt-0">
                <ProposalAttachments 
                  attachments={attachments}
                  onAttachmentUpload={handleAttachmentUpload}
                  onAttachmentRemove={handleAttachmentRemove}
                  proposalId={proposal?.id}
                />
              </TabsContent>
              
              <TabsContent value="settings" className="mt-0">
                <ProposalSettingsForm />
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
          </FormProvider>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalForm;
