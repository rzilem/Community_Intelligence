
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import FileUploader from './FileUploader';
import DataTypeSelector from './DataTypeSelector';
import AssociationSelector from '@/components/associations/AssociationSelector';
import ImportResultsTable from './ImportResultsTable';
import LoadingIndicator from './LoadingIndicator';
import NolanCityAddressGenerator from './NolanCityAddressGenerator';
import { ImportResult } from '@/types/import-types';
import { toast } from 'sonner';
import { devLog } from '@/utils/dev-logger';

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

  devLog.debug('ImportTabContent render:', { associationId, fileName: importFile?.name });

  const handleStartImport = async () => {
    if (!importFile) {
      toast.error("Please select a file to import");
      return;
    }
    
    if (!associationId) {
      toast.error("Please select an association first");
      return;
    }
    
    devLog.info('Starting import for association:', associationId);
    
    try {
      // Call the file upload handler with empty parsed data array
      // The handler will parse the file
      onFileUpload(importFile, [], selectedType);
    } catch (error) {
      devLog.error('Error starting import process:', error);
      toast.error("Failed to start the import process");
    }
  };

  return (
    <div className="space-y-6">
      {!importResults ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>
                Upload property, owner, or financial data to import into your association(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <AssociationSelector
                  initialAssociationId={associationId}
                  onAssociationChange={(id) => {
                    devLog.debug('Association changed to:', id);
                    onAssociationChange(id);
                  }}
                  label="Select Association"
                  showAllOption={true}
                />
                
                {associationId === 'all' && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      When importing for "All Associations", your file must include an association identifier column 
                      (Association ID, Association Name, or Association Code) for each row. This column will need to 
                      be mapped during the import process.
                    </AlertDescription>
                  </Alert>
                )}
                
                <DataTypeSelector 
                  value={selectedType}
                  onChange={(type) => {
                    devLog.debug('Data type changed to:', type);
                    setSelectedType(type);
                    if (importFile) {
                      onFileUpload(importFile, [], type);
                    }
                  }}
                />
                
                <FileUploader 
                  onFileSelected={(file) => {
                    devLog.debug('File selected:', file?.name);
                    if (file) {
                      // Just set the file, don't start import immediately
                      onFileUpload(file, [], selectedType);
                    }
                  }}
                  selectedFile={importFile}
                  onSubmit={handleStartImport}
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
