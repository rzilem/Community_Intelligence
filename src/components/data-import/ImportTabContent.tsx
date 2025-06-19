
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUploader from './FileUploader';
import DataTypeSelector from './DataTypeSelector';
import AssociationSelector from '@/components/associations/AssociationSelector';
import ImportResultsTable from './ImportResultsTable';
import LoadingIndicator from './LoadingIndicator';
import NolanCityAddressGenerator from './NolanCityAddressGenerator';
import ZipFileUploader from './ZipFileUploader';
import AISmartImport from './AISmartImport';
import { SmartImportErrorDisplay } from './SmartImportErrorDisplay';
import { ImportResult } from '@/types/import-types';
import { useSmartImport } from '@/hooks/import-export/useSmartImport';
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
  const [selectedZipFile, setSelectedZipFile] = React.useState<File | null>(null);
  
  const { isProcessing: isSmartProcessing, smartImportResult, processZipFile, resetSmartImport } = useSmartImport();

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
      onFileUpload(importFile, [], selectedType);
    } catch (error) {
      devLog.error('Error starting import process:', error);
      toast.error("Failed to start the import process");
    }
  };

  const handleSmartImport = async () => {
    if (!selectedZipFile) {
      toast.error("Please select a ZIP file first");
      return;
    }
    
    if (!associationId) {
      toast.error("Please select an association first");
      return;
    }

    await processZipFile(selectedZipFile, {
      associationId,
      autoImportThreshold: 0.85,
      skipValidation: false
    });
  };

  const handleImportAnother = () => {
    onImportAnother();
    resetSmartImport();
    setSelectedZipFile(null);
  };

  // Show results if we have either regular import results or smart import results
  const hasResults = importResults || smartImportResult;
  
  // Convert SmartImportResult to ImportResult format for the results table
  const displayResults = smartImportResult ? {
    ...smartImportResult,
    totalProcessed: smartImportResult.totalProcessed || smartImportResult.importedRecords,
    successfulImports: smartImportResult.successfulImports || smartImportResult.importedRecords,
    failedImports: smartImportResult.failedImports || 0
  } : importResults;

  return (
    <div className="space-y-6">
      {!hasResults ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Enhanced Data Import
              </CardTitle>
              <CardDescription>
                Choose between AI-powered bulk import or traditional single-file import. 
                AI can process entire ZIP files and reduce manual work by 90%.
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

                <Tabs defaultValue="ai-bulk" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ai-bulk" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI Bulk Import
                    </TabsTrigger>
                    <TabsTrigger value="zip" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Smart ZIP Import
                    </TabsTrigger>
                    <TabsTrigger value="single">Single File Import</TabsTrigger>
                  </TabsList>

                  <TabsContent value="ai-bulk" className="space-y-4">
                    <AISmartImport />
                  </TabsContent>

                  <TabsContent value="zip" className="space-y-4">
                    <ZipFileUploader
                      onZipSelected={setSelectedZipFile}
                      selectedFile={selectedZipFile}
                      onSmartImport={handleSmartImport}
                      isProcessing={isSmartProcessing}
                    />
                  </TabsContent>

                  <TabsContent value="single" className="space-y-4">
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
                          onFileUpload(file, [], selectedType);
                        }
                      }}
                      selectedFile={importFile}
                      onSubmit={handleStartImport}
                    />
                  </TabsContent>
                </Tabs>
                
                {(isValidating || isImporting || isSmartProcessing) && (
                  <LoadingIndicator 
                    message={
                      isSmartProcessing ? "AI processing ZIP file..." :
                      isValidating ? "Validating data..." : 
                      "Importing data..."
                    }
                  />
                )}
              </div>
            </CardContent>
          </Card>
          
          <NolanCityAddressGenerator />
        </>
      ) : (
        <div className="space-y-4">
          {/* Enhanced error display for Smart Import results */}
          {smartImportResult && !smartImportResult.success && (
            <SmartImportErrorDisplay result={smartImportResult} />
          )}
          
          <ImportResultsTable 
            results={displayResults}
            onImportAnother={handleImportAnother}
            associationId={associationId}
          />
        </div>
      )}
    </div>
  );
};

export default ImportTabContent;
