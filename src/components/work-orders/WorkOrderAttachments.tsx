
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUploader } from '@/components/ui/file-uploader';
import { Trash2, Download, Eye, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface Attachment {
  id: string;
  filename: string;
  url: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

interface WorkOrderAttachmentsProps {
  workOrderId: string;
  attachments: Attachment[];
  onAttachmentAdd: (file: File) => Promise<void>;
  onAttachmentDelete: (attachmentId: string) => Promise<void>;
  canEdit?: boolean;
}

export default function WorkOrderAttachments({ 
  workOrderId, 
  attachments, 
  onAttachmentAdd, 
  onAttachmentDelete,
  canEdit = true 
}: WorkOrderAttachmentsProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      await onAttachmentAdd(file);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    try {
      await onAttachmentDelete(attachmentId);
      toast.success('File deleted successfully');
    } catch (error) {
      toast.error('Failed to delete file');
      console.error('Delete error:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (fileType: string) => {
    return fileType.startsWith('image/');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Attachments ({attachments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {canEdit && (
          <FileUploader
            onFileSelect={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.txt"
            label={isUploading ? "Uploading..." : "Add attachment"}
            className="w-full"
          />
        )}

        {attachments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No attachments yet. Upload photos or documents to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {isImage(attachment.fileType) ? (
                        <img 
                          src={attachment.url} 
                          alt={attachment.filename}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          📄
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm truncate max-w-[150px]">
                          {attachment.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.fileSize)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(attachment.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      {isImage(attachment.fileType) ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(attachment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
