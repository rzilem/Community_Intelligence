
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DocumentCategory } from '@/types/document-types';
import DocumentUploadZone from './DocumentUploadZone';

interface DocumentUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, category: string, description: string) => void;
  categories: DocumentCategory[];
  isUploading?: boolean;
}

const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  isOpen,
  onClose,
  onUpload,
  categories,
  isUploading = false
}) => {
  const handleUpload = (file: File, category: string, description: string) => {
    onUpload(file, category, description);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isUploading && !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        
        <DocumentUploadZone
          onUpload={handleUpload}
          categories={categories}
          isUploading={isUploading}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
