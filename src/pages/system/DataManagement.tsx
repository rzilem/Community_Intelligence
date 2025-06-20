
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Database, FileSpreadsheet, Upload, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImportTabContent from '@/components/data-import/ImportTabContent';
import ExportDataTemplates from '@/components/data-import/ExportDataTemplates';
import ImportDataMappingModal from '@/components/data-import/ImportDataMappingModal';
import { useImportState } from '@/hooks/import-export/useImportState';
import DataMigrationTools from '@/components/data-management/DataMigrationTools';
import PropertiesTab from '@/components/data-management/PropertiesTab';

const DataManagement: React.FC = () => {
  const {
    selectedAssociationId,
    showMappingModal,
    validationResults,
    importResults,
    importFile,
    importData,
    importType,
    isValidating,
    isImporting,
    setShowMappingModal,
    setImportFile,
    setImportData,
    setImportType,
    handleAssociationChange,
    resetImportState,
    validateData,
    importDataWithMapping
  } = useImportState();

  // Simple file upload handler for legacy CSV/Excel imports
  const handleFileUpload = (file: File) => {
    setImportFile(file);
    // For document imports, the enhanced uploader handles everything
    // For CSV/Excel, we'd need additional processing
  };

  return (
    <PageTemplate 
      title="Data Management" 
      icon={<Database className="h-8 w-8" />}
      description="Manage associations, import/export data, and configure system settings."
    >
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage associations, import/export data, and configure system settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Data Import & Export</CardTitle>
              <CardDescription>
                Import data from CSV or Excel files, or export data templates and reports
              </CardDescription>
            </div>
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
          <TabsTrigger value="properties">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="migration">
            <Database className="h-4 w-4 mr-2" />
            Migration Tools
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
            onImportAnother={resetImportState}
            onAssociationChange={handleAssociationChange}
          />
        </TabsContent>

        <TabsContent value="export">
          <ExportDataTemplates associationId={selectedAssociationId} />
        </TabsContent>

        <TabsContent value="properties">
          <PropertiesTab associationId={selectedAssociationId} />
        </TabsContent>

        <TabsContent value="migration">
          <DataMigrationTools associationId={selectedAssociationId} />
        </TabsContent>
      </Tabs>

      {showMappingModal && (
        <ImportDataMappingModal
          open={showMappingModal}
          onOpenChange={setShowMappingModal}
          importType={importType}
          fileData={importData}
          associationId={selectedAssociationId}
          validationResults={validationResults}
          onConfirmMapping={importDataWithMapping}
          isImporting={isImporting}
        />
      )}
    </PageTemplate>
  );
};

export default DataManagement;
