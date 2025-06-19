
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Home, 
  Clock,
  RefreshCw
} from 'lucide-react';
import { DocumentStorageResult } from '@/services/import-export/types/document-types';

interface DetailedDocumentImportResultsProps {
  result: DocumentStorageResult;
  onImportAnother: () => void;
  onResume?: () => void;
}

const DetailedDocumentImportResults: React.FC<DetailedDocumentImportResultsProps> = ({
  result,
  onImportAnother,
  onResume
}) => {
  const getStatusColor = () => {
    if (result.success && result.errors.length === 0) return 'text-green-600';
    if (result.success && result.errors.length > 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (result.success && result.errors.length === 0) return <CheckCircle className="h-6 w-6 text-green-600" />;
    if (result.success && result.errors.length > 0) return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    return <XCircle className="h-6 w-6 text-red-600" />;
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className={getStatusColor()}>
                {result.success ? 'Import Complete' : 'Import Failed'}
              </CardTitle>
              <CardDescription>
                {result.associationName} • {formatTime(result.processingTime)} processing time
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{result.documentsImported}</p>
                <p className="text-sm text-muted-foreground">Documents Imported</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{result.documentsSkipped}</p>
                <p className="text-sm text-muted-foreground">Documents Skipped</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{result.createdProperties.length}</p>
                <p className="text-sm text-muted-foreground">Properties Created</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{result.totalFiles}</p>
                <p className="text-sm text-muted-foreground">Total Files</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Created Properties */}
      {result.createdProperties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Created Properties</CardTitle>
            <CardDescription>
              New properties created during import
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.createdProperties.map((property, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{property.unitNumber}</p>
                    <p className="text-sm text-muted-foreground">{property.address}</p>
                  </div>
                  <Badge variant="secondary">New</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {result.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Errors</CardTitle>
            <CardDescription>
              Issues that prevented document import
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-600">Warnings</CardTitle>
            <CardDescription>
              Issues that were handled but may need attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.warnings.map((warning, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{warning}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={onImportAnother} className="flex-1">
          <FileText className="h-4 w-4 mr-2" />
          Import Another ZIP
        </Button>
        
        {onResume && (
          <Button variant="outline" onClick={onResume}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Resume Import
          </Button>
        )}
      </div>
    </div>
  );
};

export default DetailedDocumentImportResults;
