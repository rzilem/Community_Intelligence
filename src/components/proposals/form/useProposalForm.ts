
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Proposal, ProposalAttachment, ProposalSection } from '@/types/proposal-types';

export const useProposalForm = (proposal?: Proposal) => {
  const [attachments, setAttachments] = useState<ProposalAttachment[]>(proposal?.attachments || []);
  const [sections, setSections] = useState<ProposalSection[]>(proposal?.sections || []);
  const [useAdvancedEditor, setUseAdvancedEditor] = useState(false);

  const form = useForm({
    defaultValues: {
      id: proposal?.id || '',
      lead_id: proposal?.lead_id || '',
      template_id: proposal?.template_id || '',
      name: proposal?.name || '',
      content: proposal?.content || '',
      amount: proposal?.amount || 0,
      status: proposal?.status || 'draft'
    }
  });

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

  return {
    form,
    attachments,
    sections,
    useAdvancedEditor,
    setUseAdvancedEditor,
    handleAttachmentUpload,
    handleAttachmentRemove,
    handleAdvancedContentSave
  };
};
