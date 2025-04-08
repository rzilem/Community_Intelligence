
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download } from 'lucide-react';
import AssociationSelector from '@/components/associations/AssociationSelector';
import ExportDataTemplates from '@/components/data-import/ExportDataTemplates';
import ImportDataMappingModal from '@/components/data-import/ImportDataMappingModal';
import ImportTabContent from '@/components/data-import/ImportTabContent';
import { dataImportService, validationService } from '@/services/import-export';
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
    
    setIsValidating(true);
    try {
      const results = await validationService.validateData(parsedData, type);
      console.log('Validation results:', results);
      setValidationResults(results);
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
      const results = await dataImportService.importData({
        associationId: selectedAssociationId,
        dataType: importType,
        data: importData,
        mappings,
        userId: user?.id
      });
      
      console.log('Import results:', results);
      setImportResults(results);
      
      if (results.success) {
        toast.success(`Successfully imported ${results.successfulImports} records`);
      } else {
        toast.warning(`Imported with issues: ${results.successfulImports} successful, ${results.failedImports} failed`);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import data');
      
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

        <TabsContent value="import">
          <ImportTabContent
            associationId={selectedAssociationId}
            importFile={importFile}
            importResults={importResults}
            isValidating={isValidating}
            isImporting={isImporting}
            onFileUpload={handleFileUpload}
            onImportAnother={handleImportAnother}
          />
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
