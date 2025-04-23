
import React from 'react';
import { Document } from '@/types/document-types';
import DocumentsLoadingSkeleton from '@/components/documents/content/DocumentsLoadingSkeleton';
import DocumentsTable from '@/components/documents/content/DocumentsTable';
import MobileDocumentItem from '@/components/documents/content/MobileDocumentItem';
import EmptyDocumentsState from '@/components/documents/content/EmptyDocumentsState';
import { useResponsive } from '@/hooks/use-responsive';

interface DocumentContentProps {
  isLoading: boolean;
  documents: Document[];
  visibleColumns: string[];
  onViewDocument: (document: Document) => void;
  onDownloadDocument: (document: Document) => void;
  onDeleteDocument: (document: Document) => void;
  onAnalyzeDocument?: (document: Document) => void;
}

const DocumentContent: React.FC<DocumentContentProps> = ({
  isLoading,
  documents,
  visibleColumns,
  onViewDocument,
  onDownloadDocument,
  onDeleteDocument,
  onAnalyzeDocument
}) => {
  const { isMobile } = useResponsive();
  
  if (isLoading) {
    return <DocumentsLoadingSkeleton />;
  }

  if (documents.length === 0) {
    return <EmptyDocumentsState />;
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {documents.map(doc => (
          <MobileDocumentItem
            key={doc.id}
            document={doc}
            onView={() => onViewDocument(doc)}
            onDownload={() => onDownloadDocument(doc)}
            onDelete={() => onDeleteDocument(doc)}
            onAnalyze={onAnalyzeDocument ? () => onAnalyzeDocument(doc) : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <DocumentsTable
      documents={documents}
      visibleColumns={visibleColumns}
      onViewDocument={onViewDocument}
      onDownloadDocument={onDownloadDocument}
      onDeleteDocument={onDeleteDocument}
      onAnalyzeDocument={onAnalyzeDocument}
    />
  );
};

export default DocumentContent;
