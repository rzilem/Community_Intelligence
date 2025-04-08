
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageTemplate from '@/components/layout/PageTemplate';
import { Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AssociationSelector from '@/components/associations/AssociationSelector';
import ImportDataForm from '@/components/data-import/ImportDataForm';
import ExportDataTemplates from '@/components/data-import/ExportDataTemplates';
import ImportDataMappingModal from '@/components/data-import/ImportDataMappingModal';
import ImportResultsTable from '@/components/data-import/ImportResultsTable';
import { dataImportService } from '@/services/data-import-export-service';
import { toast } from 'sonner';
import { ValidationResult, ImportResult } from '@/types/import-types';

const DataImportExport: React.FC = () => {
  const { user } = useAuth();
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>('');
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [importType, setImportType] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleAssociationChange = (associationId: string) => {
    console.log('Association changed to:', associationId);
    setSelectedAssociationId(associationId);
    // Reset the import state when the association changes
    resetImportState();
  };

  const resetImportState = () => {
    setImportFile(null);
    setImportData([]);
    setImportType('');
    setValidationResults(null);
    setImportResults(null);
    setShowMappingModal(false);
  };

  const handleFileUpload = async (file: File, parsedData: any[], type: string) => {
    console.log('File uploaded:', file.name, 'Type:', type, 'Rows:', parsedData.length);
    setImportFile(file);
    setImportData(parsedData);
    setImportType(type);
    
    // Start validation process
    setIsValidating(true);
    try {
      // Validate the data
      const results = await dataImportService.validateData(parsedData, type);
      console.log('Validation results:', results);
      setValidationResults(results);
      
      // Show the mapping modal
      setShowMappingModal(true);
    } catch (error) {
      console.error('Error validating data:', error);
      toast.error('Failed to validate the uploaded data');
    } finally {
      setIsValidating(false);
    }
  };

  const handleMappingConfirm = async (mappings: Record<string, string>) => {
    console.log('Mapping confirmed:', mappings);
    setShowMappingModal(false);
    setIsImporting(true);
    
    try {
      // Import the data with the mappings
      const results = await dataImportService.importData({
        associationId: selectedAssociationId,
        dataType: importType,
        data: importData,
        mappings,
        userId: user?.id
      });
      
      console.log('Import results:', results);
      setImportResults(results);
      
      // Show toast based on result
      if (results.success) {
        toast.success(`Successfully imported ${results.successfulImports} records`);
      } else {
        toast.warning(`Imported with issues: ${results.successfulImports} successful, ${results.failedImports} failed`);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import data');
      
      // Set import results with error
      setImportResults({
        success: false,
        totalProcessed: importData.length,
        successfulImports: 0,
        failedImports: importData.length,
        details: [
          { status: 'error', message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
        ]
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportAnother = () => {
    resetImportState();
  };

  return (
    <PageTemplate 
      title="Data Import & Export" 
      icon={<FileSpreadsheet className="h-8 w-8" />}
      description="Import and export data to and from the system."
    >
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Import data from CSV or Excel files, or export data templates and reports
              </CardDescription>
            </div>
            <AssociationSelector 
              className="md:self-end" 
              onAssociationChange={handleAssociationChange}
            />
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="h-4 w-4 mr-2" />
            Export Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          {!importFile && !importResults && (
            <ImportDataForm 
              onFileUpload={handleFileUpload}
              associationId={selectedAssociationId}
            />
          )}

          {isValidating && (
            <Card>
              <CardContent className="py-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="animate-spin">
                    <RefreshCw className="h-8 w-8 text-primary" />
                  </div>
                  <p>Validating your data, please wait...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {isImporting && (
            <Card>
              <CardContent className="py-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="animate-spin">
                    <RefreshCw className="h-8 w-8 text-primary" />
                  </div>
                  <p>Importing your data, please wait...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {importResults && (
            <ImportResultsTable 
              results={importResults}
              onImportAnother={handleImportAnother}
              associationId={selectedAssociationId}
            />
          )}
        </TabsContent>

        <TabsContent value="export">
          <ExportDataTemplates associationId={selectedAssociationId} />
        </TabsContent>
      </Tabs>

      {showMappingModal && (
        <ImportDataMappingModal
          importType={importType}
          fileData={importData}
          associationId={selectedAssociationId}
          validationResults={validationResults || undefined}
          onClose={() => setShowMappingModal(false)}
          onConfirm={handleMappingConfirm}
        />
      )}
    </PageTemplate>
  );
};

export default DataImportExport;
