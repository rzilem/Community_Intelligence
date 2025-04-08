
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AssociationSelector from '@/components/associations/AssociationSelector';
import ImportDataForm from '@/components/data-import/ImportDataForm';
import ExportDataTemplates from '@/components/data-import/ExportDataTemplates';
import ImportDataMappingModal from '@/components/data-import/ImportDataMappingModal';
import ImportResultsTable from '@/components/data-import/ImportResultsTable';

const DataImportExport: React.FC = () => {
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>('');
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [importResults, setImportResults] = useState<any>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<string>('');

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  const handleFileUpload = (file: File, type: string) => {
    setImportFile(file);
    setImportType(type);
    // Simulate validation process
    setTimeout(() => {
      // This would be replaced with actual validation logic
      setValidationResults({
        valid: true,
        totalRows: 150,
        validRows: 147,
        invalidRows: 3,
        warnings: 5,
        issues: [
          { row: 5, field: 'email', issue: 'Invalid email format' },
          { row: 28, field: 'phone', issue: 'Invalid phone number' },
          { row: 103, field: 'zipCode', issue: 'Missing zip code' }
        ]
      });
      setShowMappingModal(true);
    }, 1000);
  };

  const handleMappingConfirm = (mappings: Record<string, string>) => {
    setShowMappingModal(false);
    // In a real implementation, we would process the file with the mappings
    // and then save to Supabase
    console.log('Processing with mappings:', mappings);
    
    // Simulate import process
    setTimeout(() => {
      setImportResults({
        success: true,
        totalProcessed: 150,
        successfulImports: 147,
        failedImports: 3,
        details: [
          { status: 'success', message: '147 records imported successfully' },
          { status: 'error', message: '3 records failed validation' }
        ]
      });
    }, 1500);
  };

  const handleImportAnother = () => {
    setImportFile(null);
    setImportType('');
    setValidationResults(null);
    setImportResults(null);
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

          {validationResults && !importResults && (
            <Card>
              <CardHeader>
                <CardTitle>Validation Results</CardTitle>
                <CardDescription>
                  Review validation results before proceeding with the import
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>
                      <strong>{validationResults.validRows}</strong> valid rows
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <span>
                      <strong>{validationResults.warnings}</strong> warnings
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <span>
                      <strong>{validationResults.invalidRows}</strong> invalid rows
                    </span>
                  </div>
                </div>

                {validationResults.issues.length > 0 && (
                  <div className="border rounded-md p-4 bg-muted/50 mb-4">
                    <h3 className="font-medium mb-2">Issues Found:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {validationResults.issues.map((issue: any, index: number) => (
                        <li key={index}>
                          Row {issue.row}: {issue.issue} in field "{issue.field}"
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {importResults && (
            <ImportResultsTable 
              results={importResults}
              onImportAnother={handleImportAnother}
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
          onClose={() => setShowMappingModal(false)}
          onConfirm={handleMappingConfirm}
        />
      )}
    </PageTemplate>
  );
};

export default DataImportExport;
