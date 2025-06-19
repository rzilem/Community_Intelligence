
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileSpreadsheet, FileArchive, Upload } from 'lucide-react';
import ImportDataForm from './ImportDataForm';
import DocumentStorageUploader from './DocumentStorageUploader';
import EnhancedDocumentStorageUploader from './EnhancedDocumentStorageUploader';
import ZipFileUploader from './ZipFileUploader';
import { ImportResult } from '@/types/import-types';

interface ImportTabContentProps {
  associationId: string | null;
  importFile: File | null;
  importResults: ImportResult | null;
  isValidating: boolean;
  isImporting: boolean;
  onFileUpload: (file: File) => void;
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
    <Card>
      <CardHeader>
        <CardTitle>Import Data</CardTitle>
        <CardDescription>
          Import various types of data from CSV/Excel files or document collections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="documents-enhanced" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="documents-enhanced" className="flex items-center gap-2">
              <FileArchive className="h-4 w-4" />
              Enhanced Documents
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileArchive className="h-4 w-4" />
              Document Storage
            </TabsTrigger>
            <TabsTrigger value="csv-excel" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV / Excel
            </TabsTrigger>
            <TabsTrigger value="bulk-zip" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Bulk ZIP
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents-enhanced">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Enhanced Document Import</h4>
                <p className="text-sm text-blue-800">
                  Improved version with better error handling, larger file size limits (500MB), 
                  intelligent property matching, and enhanced progress tracking.
                </p>
              </div>
              <EnhancedDocumentStorageUploader />
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Legacy Document Import</h4>
                <p className="text-sm text-gray-700">
                  Original document import system. Use Enhanced Documents for better performance.
                </p>
              </div>
              <DocumentStorageUploader />
            </div>
          </TabsContent>

          <TabsContent value="csv-excel">
            <ImportDataForm
              associationId={associationId}
              importFile={importFile}
              importResults={importResults}
              isValidating={isValidating}
              isImporting={isImporting}
              onFileUpload={onFileUpload}
              onImportAnother={onImportAnother}
              onAssociationChange={onAssociationChange}
            />
          </TabsContent>

          <TabsContent value="bulk-zip">
            <ZipFileUploader />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ImportTabContent;
