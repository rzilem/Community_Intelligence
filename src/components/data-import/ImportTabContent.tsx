
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FileUploader from './FileUploader';
import DataTypeSelector from './DataTypeSelector';
import AssociationSelector from '@/components/associations/AssociationSelector';
import ImportResultsTable from './ImportResultsTable';
import LoadingIndicator from './LoadingIndicator';
import { ImportResult } from '@/types/import-types';
import NolanCityAddressGenerator from './NolanCityAddressGenerator';

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
  onAssociationChange
}) => {
  return (
    <div className="space-y-6">
      {!importResults ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>
                Upload property, owner, or financial data to import into your association
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <AssociationSelector
                  value={associationId}
                  onChange={onAssociationChange}
                  label="Select Association"
                  placeholder="Choose an association"
                  required
                />
                
                <DataTypeSelector 
                  disabledImportTypes={!associationId ? ['all'] : []}
                  onSelectType={(type) => {
                    if (importFile) {
                      onFileUpload(importFile, [], type);
                    }
                  }}
                />
                
                <FileUploader 
                  onFileUpload={onFileUpload}
                  disabled={!associationId}
                />
                
                {(isValidating || isImporting) && (
                  <LoadingIndicator 
                    text={isValidating ? "Validating data..." : "Importing data..."}
                  />
                )}
              </div>
            </CardContent>
          </Card>
          
          <NolanCityAddressGenerator />
        </>
      ) : (
        <ImportResultsTable 
          results={importResults}
          onImportAnother={onImportAnother}
        />
      )}
    </div>
  );
};

export default ImportTabContent;
