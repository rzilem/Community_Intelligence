
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
  const [selectedType, setSelectedType] = React.useState('associations');

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
                  initialAssociationId={associationId}
                  onAssociationChange={onAssociationChange}
                  label="Select Association"
                />
                
                <DataTypeSelector 
                  value={selectedType}
                  onChange={(type) => {
                    setSelectedType(type);
                    if (importFile) {
                      onFileUpload(importFile, [], type);
                    }
                  }}
                />
                
                <FileUploader 
                  onFileSelected={(file) => {
                    if (file && associationId) {
                      onFileUpload(file, [], selectedType);
                    }
                  }}
                  selectedFile={importFile}
                />
                
                {(isValidating || isImporting) && (
                  <LoadingIndicator 
                    message={isValidating ? "Validating data..." : "Importing data..."}
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
          associationId={associationId}
        />
      )}
    </div>
  );
};

export default ImportTabContent;
