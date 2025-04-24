
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Document } from '@/types/document-types';
import DocumentPreview from './DocumentPreview';

interface PreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

const PreviewDialog: React.FC<PreviewDialogProps> = ({
  isOpen,
  onClose,
  document
}) => {
  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DocumentPreview 
          document={document} 
          className="flex-1 overflow-y-auto"
        />
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialog;
