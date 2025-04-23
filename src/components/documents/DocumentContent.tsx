import React from 'react';
import { Document } from '@/types/document-types';
import DocumentsLoadingSkeleton from '@/components/documents/content/DocumentsLoadingSkeleton';
import DocumentsTable from '@/components/documents/content/DocumentsTable';
import MobileDocumentItem from '@/components/documents/content/MobileDocumentItem';
import EmptyDocumentsState from '@/components/documents/content/EmptyDocumentsState';
import { useResponsive } from '@/hooks/use-responsive';
import DocumentAnalysisActions from './content/DocumentAnalysisActions';

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

  // Add state for analysis results
  const [currentAnalysis, setCurrentAnalysis] = React.useState<any>(null);
  const [analyzedDocument, setAnalyzedDocument] = React.useState<Document | null>(null);

  // Update the analysis handler
  const handleAnalyzeDocument = async (doc: Document) => {
    if (onAnalyzeDocument) {
      setAnalyzedDocument(doc);
      try {
        const response = await onAnalyzeDocument(doc);
        setCurrentAnalysis(response.analysis);
      } catch (error) {
        console.error('Error analyzing document:', error);
      }
    }
  };

  if (isLoading) {
    return <DocumentsLoadingSkeleton />;
  }

  if (documents.length === 0) {
    return <EmptyDocumentsState />;
  }

  return (
    <div className="space-y-6">
      {currentAnalysis && analyzedDocument && (
        <DocumentAnalysisActions 
          analysis={currentAnalysis} 
          documentName={analyzedDocument.name}
        />
      )}
      
      {isMobile ? (
        <div className="space-y-4">
          {documents.map(doc => (
            <MobileDocumentItem
              key={doc.id}
              document={doc}
              onView={() => onViewDocument(doc)}
              onDownload={() => onDownloadDocument(doc)}
              onDelete={() => onDeleteDocument(doc)}
              onAnalyze={() => handleAnalyzeDocument(doc)}
            />
          ))}
        </div>
      ) : (
        <DocumentsTable
          documents={documents}
          visibleColumns={visibleColumns}
          onViewDocument={onViewDocument}
          onDownloadDocument={onDownloadDocument}
          onDeleteDocument={onDeleteDocument}
          onAnalyzeDocument={handleAnalyzeDocument}
        />
      )}
    </div>
  );
};

export default DocumentContent;
