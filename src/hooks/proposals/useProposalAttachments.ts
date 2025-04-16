
import { ProposalAttachment } from '@/types/proposal-types';
import { supabase } from '@/integrations/supabase/client';

export const useProposalAttachments = () => {
  const uploadAttachment = async (file: File, proposalId?: string): Promise<ProposalAttachment> => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('proposal_attachments')
      .upload(fileName, file);

    if (uploadError) {
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('proposal_attachments')
      .getPublicUrl(fileName);
      
    const attachmentData: ProposalAttachment = {
      id: `temp-${Date.now()}`,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' :
            file.type === 'application/pdf' ? 'pdf' :
            file.type.includes('document') ? 'document' : 'other',
      url: publicUrl,
      size: file.size,
      content_type: file.type,
      created_at: new Date().toISOString()
    };
    
    if (proposalId) {
      const { data, error } = await supabase
        .from('proposal_attachments')
        .insert({
          proposal_id: proposalId,
          name: attachmentData.name,
          type: attachmentData.type,
          url: attachmentData.url,
          size: attachmentData.size,
          content_type: attachmentData.content_type
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating attachment record:', error);
      } else if (data) {
        attachmentData.id = data.id;
      }
    }
    
    return attachmentData;
  };

  return {
    uploadAttachment
  };
};
