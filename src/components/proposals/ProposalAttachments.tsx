
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Image, Video, File, X, Loader2 } from 'lucide-react';
import { ProposalAttachment } from '@/types/proposal-types';
import { useProposals } from '@/hooks/proposals/useProposals';
import { toast } from 'sonner';

interface ProposalAttachmentsProps {
  attachments: ProposalAttachment[];
  onAttachmentUpload: (attachment: ProposalAttachment) => void;
  onAttachmentRemove: (id: string) => void;
  proposalId?: string;
}

const ProposalAttachments: React.FC<ProposalAttachmentsProps> = ({
  attachments,
  onAttachmentUpload,
  onAttachmentRemove,
  proposalId
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { uploadAttachment } = useProposals();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const attachment = await uploadAttachment(file, proposalId);
          onAttachmentUpload(attachment);
        } catch (error: any) {
          toast.error(`Error uploading ${file.name}: ${error.message}`);
        }
      }
    } finally {
      setIsUploading(false);
      // Clear the input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6">
        <Upload className="h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">Drag and drop files here, or</p>
        <label htmlFor="file-upload" className="mt-2">
          <Button variant="outline" type="button" className="relative" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Browse files'
            )}
            <input 
              id="file-upload" 
              type="file" 
              multiple 
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4,.mov" 
              className="sr-only"
              onChange={handleFileUpload}
              disabled={isUploading}
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
                  onClick={() => onAttachmentRemove(attachment.id)}
                  type="button"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalAttachments;
