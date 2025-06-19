
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, XCircle, RefreshCw, FileText } from 'lucide-react';
import { DocumentStorageResult } from '@/services/import-export/document-storage-processor';

interface DocumentImportResultsProps {
  result: DocumentStorageResult;
  onImportAnother: () => void;
  onResume?: () => void;
}

const DocumentImportResults: React.FC<DocumentImportResultsProps> = ({
  result,
  onImportAnother,
  onResume
}) => {
  const getStatusIcon = () => {
    if (result.success) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (result.errors.length > 0) return <XCircle className="h-5 w-5 text-red-600" />;
    return <AlertCircle className="h-5 w-5 text-yellow-600" />;
  };

  const getStatusColor = () => {
    if (result.success && result.errors.length === 0) return 'text-green-600';
    if (result.errors.length > 0) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${getStatusColor()}`}>
          {getStatusIcon()}
          Import Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{result.documentsImported}</div>
            <div className="text-sm text-muted-foreground">Documents Imported</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{result.unitsProcessed}</div>
            <div className="text-sm text-muted-foreground">Units Processed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{result.warnings.length}</div>
            <div className="text-sm text-muted-foreground">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
            <div className="text-sm text-muted-foreground">Errors</div>
          </div>
        </div>

        {result.associationName && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Association: {result.associationName}</span>
            </div>
          </div>
        )}

        {result.warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-yellow-800">Warnings:</h4>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-h-32 overflow-y-auto">
              {result.warnings.map((warning, index) => (
                <div key={index} className="text-sm text-yellow-700">{warning}</div>
              ))}
            </div>
          </div>
        )}

        {result.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-800">Errors:</h4>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-32 overflow-y-auto">
              {result.errors.map((error, index) => (
                <div key={index} className="text-sm text-red-700">{error}</div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button onClick={onImportAnother} className="flex-1">
            Import Another Archive
          </Button>
          {onResume && (
            <Button variant="outline" onClick={onResume} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Resume Import
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentImportResults;
