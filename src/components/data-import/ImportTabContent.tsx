
import React from 'react';
import ImportDataForm from './ImportDataForm';
import ImportResultsTable from './ImportResultsTable';
import LoadingIndicator from './LoadingIndicator';
import { ImportResult } from '@/types/import-types';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Upload } from 'lucide-react';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { toast } from 'sonner';

interface ImportTabContentProps {
  associationId: string;
  importFile: File | null;
  importResults: ImportResult | null;
  isValidating: boolean;
  isImporting: boolean;
  onFileUpload: (file: File, parsedData: any[], type: string) => void;
  onImportAnother: () => void;
  onAssociationChange: (associationId: string) => void;
}

const ImportTabContent: React.FC<ImportTabContentProps> = ({
  associationId,
  importFile,
  importResults,
  isValidating,
  isImporting,
  onFileUpload,
  onImportAnother,
  onAssociationChange,
}) => {
  const handleProceedWithImport = () => {
    if (!associationId) {
      toast.error("Please select an association before proceeding");
      return;
    }
    
    if (importFile) {
      console.log('Proceeding with import:', importFile.name, 'Association:', associationId);
      onFileUpload(importFile, [], importFile.name.split('.').pop() || '');
    } else {
      toast.error("No file selected");
    }
  };

  return (
    <div className="space-y-4">
      {!importFile && !importResults && (
        <ImportDataForm 
          onFileUpload={onFileUpload}
          associationId={associationId}
          onAssociationChange={onAssociationChange}
        />
      )}

      {isValidating && (
        <LoadingIndicator message="Validating your data, please wait..." />
      )}

      {isImporting && (
        <LoadingIndicator message="Importing your data, please wait..." />
      )}

      {importFile && !isValidating && !importResults && (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-between border rounded-md p-3 bg-muted/30 w-full">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm truncate max-w-[200px]">{importFile.name}</span>
              <span className="text-xs text-muted-foreground">
                {(importFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={onImportAnother}
            >
              Remove
            </Button>
          </div>
          
          <div className="w-full">
            <h3 className="text-sm font-medium mb-2">Select Association</h3>
            <AssociationSelector 
              onAssociationChange={onAssociationChange} 
            />
          </div>
          
          <Button 
            onClick={handleProceedWithImport}
            className="w-full md:w-auto"
            disabled={!associationId}
          >
            <Upload className="mr-2 h-4 w-4" />
            {associationId ? "Proceed with Import" : "Select an Association First"}
          </Button>
        </div>
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
