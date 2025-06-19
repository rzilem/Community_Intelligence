
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, FileText, Home, Users, Building } from 'lucide-react';
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
    if (result.success) {
      return <CheckCircle className="h-8 w-8 text-green-500" />;
    } else if (result.warnings.length > 0) {
      return <AlertCircle className="h-8 w-8 text-yellow-500" />;
    } else {
      return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getStatusMessage = () => {
    if (result.success) {
      return 'Document import completed successfully!';
    } else {
      return 'Document import failed. Please check the errors below.';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle>{getStatusMessage()}</CardTitle>
              <CardDescription>
                {result.associationName && `Association: ${result.associationName}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Properties Created</p>
                  <p className="text-2xl font-bold text-blue-800">{result.propertiesCreated}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">Units Created</p>
                  <p className="text-2xl font-bold text-green-800">{result.unitsCreated}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600">Documents Imported</p>
                  <p className="text-2xl font-bold text-purple-800">{result.documentsImported}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-600">Documents Skipped</p>
                  <p className="text-2xl font-bold text-orange-800">{result.documentsSkipped}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timing Information */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              Processing completed in {(result.processingTime / 1000).toFixed(2)} seconds
            </p>
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Warnings ({result.warnings.length})
              </h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <ul className="list-disc list-inside space-y-1">
                  {result.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-800">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-800 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Errors ({result.errors.length})
              </h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <ul className="list-disc list-inside space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-800">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={onImportAnother} variant="outline">
              Import Another ZIP
            </Button>
            {onResume && (
              <Button onClick={onResume} variant="secondary">
                Resume Import
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {result.success && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                • Review the imported properties and units in the Properties section
              </p>
              <p className="text-sm text-gray-600">
                • Check the Documents section to see your imported files
              </p>
              <p className="text-sm text-gray-600">
                • Add owner information to the properties if not already present
              </p>
              <p className="text-sm text-gray-600">
                • Set up any additional property details or assessment schedules
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentImportResults;
