
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download } from 'lucide-react';
import ImportTabContent from '@/components/data-import/ImportTabContent';
import ExportDataTemplates from '@/components/data-import/ExportDataTemplates';
import ImportDataMappingModal from '@/components/data-import/ImportDataMappingModal';
import OneClickAIImport from '@/components/data-import/OneClickAIImport';
import AIImportHistory from '@/components/data-import/AIImportHistory';
import { useImportState } from '@/hooks/import-export/useImportState';

const DataImportExport: React.FC = () => {
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
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="ai-import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ai-import">
            <Upload className="h-4 w-4 mr-2" />
            AI Import (New)
          </TabsTrigger>
          <TabsTrigger value="legacy-import">
            <Upload className="h-4 w-4 mr-2" />
            Legacy Import
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="h-4 w-4 mr-2" />
            Export Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-import">
          <div className="space-y-6">
            <OneClickAIImport 
              associationId={selectedAssociationId || ''}
              onImportComplete={(results) => {
                console.log('AI Import completed:', results);
                // Refresh history after successful import
                window.location.reload();
              }}
            />
            <AIImportHistory associationId={selectedAssociationId || ''} />
          </div>
        </TabsContent>

        <TabsContent value="legacy-import">
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

export default DataImportExport;
