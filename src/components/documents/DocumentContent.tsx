
import React from 'react';
import { Loader2 } from 'lucide-react';
import DocumentTable from '@/components/documents/DocumentTable';
import { Document } from '@/types/document-types';

interface DocumentContentProps {
  isLoading: boolean;
  documents: Document[];
  onViewDocument: (doc: Document) => void;
  onDownloadDocument: (doc: Document) => void;
  onDeleteDocument: (doc: Document) => void;
}

const DocumentContent: React.FC<DocumentContentProps> = ({
  isLoading,
  documents,
  onViewDocument,
  onDownloadDocument,
  onDeleteDocument
}) => {
  return (
    <>
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <DocumentTable
          documents={documents}
          onView={onViewDocument}
          onDownload={onDownloadDocument}
          onDelete={onDeleteDocument}
        />
      )}
    </>
  );
};

export default DocumentContent;
