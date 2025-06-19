
import React from 'react';
import { DocumentStorageResult } from '@/services/import-export/types/document-types';
import DetailedDocumentImportResults from './DetailedDocumentImportResults';

interface DocumentImportResultsProps {
  result: DocumentStorageResult;
  onImportAnother: () => void;
  onResume?: () => void;
}

const DocumentImportResults: React.FC<DocumentImportResultsProps> = ({
  result,
  onImportAnother,
  onResume
}) => {
  return (
    <DetailedDocumentImportResults
      result={result}
      onImportAnother={onImportAnother}
      onResume={onResume}
    />
  );
};

export default DocumentImportResults;
