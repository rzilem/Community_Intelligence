
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Proposal } from '@/types/proposal-types';
import { useLeads } from '@/hooks/leads/useLeads';
import { useProposalTemplates } from '@/hooks/proposals/useProposalTemplates';
import { FormProvider } from 'react-hook-form';
import ProposalAttachments from './ProposalAttachments';
import ProposalSettingsForm from './ProposalSettingsForm';
import ProposalContentTab from './form/ProposalContentTab';
import { useProposalForm } from './form/useProposalForm';

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
  const [activeTab, setActiveTab] = React.useState("content");
  const [isSaving, setIsSaving] = React.useState(false);
  
  const {
    form,
    attachments,
    useAdvancedEditor,
    setUseAdvancedEditor,
    handleAttachmentUpload,
    handleAttachmentRemove,
    handleAdvancedContentSave
  } = useProposalForm(proposal);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      form.setValue('content', template.content);
      form.setValue('template_id', template.id);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      await onSave({
        ...data,
        attachments
      });
      onClose();
    } catch (error) {
      console.error('Error saving proposal:', error);
    } finally {
      setIsSaving(false);
    }
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
                <ProposalContentTab
                  leads={leads}
                  templates={templates}
                  templatesLoading={templatesLoading}
                  onTemplateChange={handleTemplateChange}
                  showLeadSelector={!leadId}
                  useAdvancedEditor={useAdvancedEditor}
                  onToggleEditor={() => setUseAdvancedEditor(!useAdvancedEditor)}
                  onAdvancedContentSave={handleAdvancedContentSave}
                />
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
