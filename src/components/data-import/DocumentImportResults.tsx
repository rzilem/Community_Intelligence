
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, FileText, Home, User, Clock, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {result.success ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <AlertCircle className="h-6 w-6 text-orange-500" />
          )}
          <div>
            <CardTitle>
              Document Import {result.success ? 'Completed' : 'Completed with Issues'}
            </CardTitle>
            <CardDescription>
              Successfully processed {result.documentsImported} documents for {result.associationName}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">{result.documentsImported}</div>
            <div className="text-sm text-blue-700">Documents</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <Home className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">{result.createdProperties.length}</div>
            <div className="text-sm text-green-700">Properties</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <User className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">{result.createdOwners.length}</div>
            <div className="text-sm text-purple-700">Owners</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <div className="text-2xl font-bold text-gray-600">{formatTime(result.processingTime)}</div>
            <div className="text-sm text-gray-700">Processing Time</div>
          </div>
        </div>

        {/* Created Properties */}
        {result.createdProperties.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Home className="h-5 w-5" />
              Created Properties ({result.createdProperties.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
              {result.createdProperties.map((property) => (
                <div key={property.id} className="border rounded-lg p-3">
                  <div className="font-medium">{property.address}</div>
                  <div className="text-sm text-gray-600">Unit {property.unitNumber}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Created Owners */}
        {result.createdOwners.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Created Owners ({result.createdOwners.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
              {result.createdOwners.map((owner) => (
                <div key={owner.id} className="border rounded-lg p-3">
                  <div className="font-medium">{owner.name}</div>
                  <div className="text-sm text-gray-600">{owner.email}</div>
                  {owner.phone && (
                    <div className="text-sm text-gray-600">{owner.phone}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Processing Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Files:</span>
              <span className="ml-2 font-medium">{result.totalFiles}</span>
            </div>
            <div>
              <span className="text-gray-600">Documents Imported:</span>
              <span className="ml-2 font-medium text-green-600">{result.documentsImported}</span>
            </div>
            <div>
              <span className="text-gray-600">Documents Skipped:</span>
              <span className="ml-2 font-medium text-orange-600">{result.documentsSkipped}</span>
            </div>
            <div>
              <span className="text-gray-600">Processing Time:</span>
              <span className="ml-2 font-medium">{formatTime(result.processingTime)}</span>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-orange-700">Warnings</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {result.warnings.map((warning, index) => (
                <div key={index} className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                  {warning}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Errors */}
        {result.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-700">Errors</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {result.errors.map((error, index) => (
                <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button onClick={onImportAnother} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Import Another ZIP
          </Button>
          
          {onResume && (
            <Button onClick={onResume} variant="outline">
              Resume Processing
            </Button>
          )}
        </div>

        {/* Success Message */}
        {result.success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Import Successful!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your documents have been imported and are now accessible from the property and owner profile pages.
              {result.createdProperties.length > 0 && ` ${result.createdProperties.length} properties were created with proper addresses.`}
              {result.createdOwners.length > 0 && ` ${result.createdOwners.length} owner records were established.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentImportResults;
