
import React, { useState } from 'react';
import { Document } from '@/types/document-types';
import { DocumentWithVersions, VersionHistoryState } from '@/types/document-versioning-types';
import { useIsMobile } from '@/hooks/use-mobile';
import DocumentVersionHistory from './DocumentVersionHistory';
import DocumentsTable from './content/DocumentsTable';
import MobileDocumentItem from './content/MobileDocumentItem';
import DocumentsLoadingSkeleton from './content/DocumentsLoadingSkeleton';
import EmptyDocumentsState from './content/EmptyDocumentsState';

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
  const [versionHistory, setVersionHistory] = useState<VersionHistoryState>({
    isOpen: false,
    document: undefined
  });
  const isMobile = useIsMobile();
  
  // Function to handle opening version history
  const handleOpenVersionHistory = (doc: Document) => {
    setVersionHistory({
      isOpen: true,
      document: doc as DocumentWithVersions
    });
  };
  
  // Function to handle closing version history
  const handleCloseVersionHistory = () => {
    setVersionHistory({
      isOpen: false,
      document: undefined
    });
  };

  if (isLoading) {
    return <DocumentsLoadingSkeleton />;
  }

  if (documents.length === 0) {
    return <EmptyDocumentsState />;
  }

  return (
    <>
      {isMobile ? (
        <div className="space-y-4">
          {documents.map((doc) => (
            <MobileDocumentItem
              key={doc.id}
              doc={doc}
              onViewDocument={onViewDocument}
              onDownloadDocument={onDownloadDocument}
              onDeleteDocument={onDeleteDocument}
              onOpenVersionHistory={handleOpenVersionHistory}
            />
          ))}
        </div>
      ) : (
        <DocumentsTable
          documents={documents}
          onViewDocument={onViewDocument}
          onDownloadDocument={onDownloadDocument}
          onDeleteDocument={onDeleteDocument}
          onOpenVersionHistory={handleOpenVersionHistory}
        />
      )}
      
      <DocumentVersionHistory 
        isOpen={versionHistory.isOpen}
        onClose={handleCloseVersionHistory}
        document={versionHistory.document}
      />
    </>
  );
};

export default DocumentContent;
