
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText } from 'lucide-react';
import { useResponsive } from '@/hooks/use-responsive';
import DocumentContent from '@/components/documents/DocumentContent';
import { useAuth } from '@/contexts/auth';
import { useDocuments, useDocumentOperations } from '@/hooks/documents';
import { toast } from 'sonner';
import { Document } from '@/types/document-types';

const Documents = () => {
  const { isMobile } = useResponsive();
  const { currentAssociation } = useAuth();
  const [category, setCategory] = useState<string | null>(null);
  
  const { data: documents = [], isLoading } = useDocuments({
    associationId: currentAssociation?.id,
    category: category
  });
  
  const { handleViewDocument, handleDownloadDocument, handleDeleteDocument } = useDocumentOperations();
  
  // Handlers for DocumentContent component
  const onViewDocument = (doc: Document) => {
    handleViewDocument(doc);
  };
  
  const onDownloadDocument = (doc: Document) => {
    handleDownloadDocument(doc);
    toast.success('Document downloaded successfully');
  };
  
  const onDeleteDocument = (doc: Document) => {
    handleDeleteDocument(doc.id).then(() => {
      toast.success('Document deleted successfully');
    });
  };
  
  return (
    <PageTemplate 
      title="Documents" 
      icon={<FileText className="h-8 w-8" />}
      description="Access and manage community documents and files."
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
