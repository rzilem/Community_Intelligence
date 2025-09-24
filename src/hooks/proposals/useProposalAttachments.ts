
import { ProposalAttachment } from '@/types/proposal-types';

export const useProposalAttachments = () => {
  const uploadAttachment = async (file: File, proposalId?: string): Promise<ProposalAttachment> => {
    // Mock: Create attachment data
    const attachmentData: ProposalAttachment = {
      id: `mock-${Date.now()}`,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' :
            file.type === 'application/pdf' ? 'pdf' :
            file.type.includes('document') ? 'document' : 'other',
      url: `mock://attachments/${file.name}`,
      size: file.size,
      content_type: file.type,
      created_at: new Date().toISOString()
    };
    
    console.log(`Mock: Uploading attachment for proposal ${proposalId}`, attachmentData);
    
    return attachmentData;
  };

  return {
    uploadAttachment
  };
};
