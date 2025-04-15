
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText, Plus } from 'lucide-react';
import { useResponsive } from '@/hooks/use-responsive';
import DocumentContent from '@/components/documents/DocumentContent';
import { useAuth } from '@/contexts/auth';
import { useDocuments, useDocumentOperations } from '@/hooks/documents';
import { toast } from 'sonner';
import { Document } from '@/types/document-types';
import { Button } from '@/components/ui/button';
import { saveAs } from 'file-saver';

const Documents = () => {
  const { isMobile } = useResponsive();
  const { currentAssociation } = useAuth();
  const [category, setCategory] = useState<string | null>(null);
  
  const { documents, isLoading } = useDocuments({
    associationId: currentAssociation?.id,
    category: category
  });
  
  const { deleteDocument } = useDocumentOperations();
  
  // Implement document handling functions
  const onViewDocument = (doc: Document) => {
    window.open(doc.url, '_blank');
  };
  
  const onDownloadDocument = (doc: Document) => {
    // Use file-saver to download the document
    saveAs(doc.url, doc.name);
    toast.success('Document downloaded successfully');
  };
  
  const onDeleteDocument = (doc: Document) => {
    deleteDocument.mutate(doc, {
      onSuccess: () => {
        toast.success('Document deleted successfully');
      },
      onError: (error) => {
        toast.error(`Failed to delete document: ${error.message}`);
      }
    });
  };
  
  return (
    <PageTemplate 
      title="Documents" 
      icon={<FileText className="h-8 w-8" />}
      description="Access and manage community documents and files."
      actions={
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      }
    >
      <div className={isMobile ? 'p-0' : ''}>
        <DocumentContent 
          isLoading={isLoading}
          documents={documents}
          onViewDocument={onViewDocument}
          onDownloadDocument={onDownloadDocument}
          onDeleteDocument={onDeleteDocument}
        />
      </div>
    </PageTemplate>
  );
};

export default Documents;
