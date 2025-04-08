
import React from 'react';
import ImportDataForm from './ImportDataForm';
import ImportResultsTable from './ImportResultsTable';
import LoadingIndicator from './LoadingIndicator';
import { ValidationResult, ImportResult } from '@/types/import-types';

interface ImportTabContentProps {
  associationId: string;
  importFile: File | null;
  importResults: ImportResult | null;
  isValidating: boolean;
  isImporting: boolean;
  onFileUpload: (file: File, parsedData: any[], type: string) => void;
  onImportAnother: () => void;
}

const ImportTabContent: React.FC<ImportTabContentProps> = ({
  associationId,
  importFile,
  importResults,
  isValidating,
  isImporting,
  onFileUpload,
  onImportAnother,
}) => {
  return (
    <div className="space-y-4">
      {!importFile && !importResults && (
        <ImportDataForm 
          onFileUpload={onFileUpload}
          associationId={associationId}
        />
      )}

      {isValidating && (
        <LoadingIndicator message="Validating your data, please wait..." />
      )}

      {isImporting && (
        <LoadingIndicator message="Importing your data, please wait..." />
      )}

      {importResults && (
        <ImportResultsTable 
          results={importResults}
          onImportAnother={onImportAnother}
          associationId={associationId}
        />
      )}
    </div>
  );
};

export default ImportTabContent;
