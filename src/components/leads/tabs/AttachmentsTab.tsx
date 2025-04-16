import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lead, LeadAttachment } from '@/types/lead-types';
import { Download, File, Paperclip, Upload } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface AttachmentsTabProps {
  lead: Lead;
}

const AttachmentsTab: React.FC<AttachmentsTabProps> = ({ lead }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // This is just a placeholder - implement actual upload functionality
    toast.success(`File ${files[0].name} selected for upload`);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDownload = (attachment: LeadAttachment) => {
    window.open(attachment.url, '_blank');
    toast.success(`Downloading ${attachment.name}`);
  };
  
  const renderAttachments = () => {
    if (!lead.uploaded_files || lead.uploaded_files.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Paperclip className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
          <p>No attachments available for this lead.</p>
        </div>
      );
    }
    
    return (
      <ScrollArea className="h-[60vh]">
        <div className="space-y-2 p-1">
          {lead.uploaded_files.map((attachment: LeadAttachment, index: number) => (
            <div key={attachment.id || index} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/30 transition-colors">
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
      </ScrollArea>
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
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Attachments</CardTitle>
          <div>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload File
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderAttachments()}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttachmentsTab;
