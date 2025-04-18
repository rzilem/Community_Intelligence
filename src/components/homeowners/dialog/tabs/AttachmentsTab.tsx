
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUploader } from '@/components/ui/file-uploader';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { Download, File, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

interface AttachmentsTabProps {
  request: HomeownerRequest;
}

const AttachmentsTab: React.FC<AttachmentsTabProps> = ({ request }) => {
  const handleFileUpload = async (file: File) => {
    toast.success(`File ${file.name} selected for upload`);
    // Implementation for file upload will be added when backend storage is set up
  };
  
  const handleDownload = (attachment: any) => {
    window.open(attachment.url, '_blank');
    toast.success(`Downloading ${attachment.name}`);
  };
  
  const renderAttachments = () => {
    // This is a placeholder - we'll implement actual attachments fetching when backend is set up
    const attachments = [];
    
    if (attachments.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Paperclip className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
          <p>No attachments available for this request.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-2 p-1">
        {attachments.map((attachment: any, index: number) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <File className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">{attachment.name}</p>
                <p className="text-xs text-muted-foreground">
                  {attachment.type} • {formatFileSize(attachment.size)}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDownload(attachment)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );
  };
  
  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };
  
  return (
    <div className="h-full overflow-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Attachments</CardTitle>
          <FileUploader
            onFileSelect={handleFileUpload}
            accept="*"
            label="Upload File"
          />
        </CardHeader>
        <CardContent>
          {renderAttachments()}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttachmentsTab;
