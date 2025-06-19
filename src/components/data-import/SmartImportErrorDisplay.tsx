
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileX, Info } from 'lucide-react';
import { SmartImportResult } from '@/types/import-types';

interface SmartImportErrorDisplayProps {
  result: SmartImportResult;
}

export const SmartImportErrorDisplay: React.FC<SmartImportErrorDisplayProps> = ({ result }) => {
  const renderError = (error: any): string => {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error?.message) return error.message;
    return 'Unknown error occurred';
  };

  return (
    <div className="space-y-4">
      {result.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Processing Errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {result.errors.map((error, index) => (
                  <li key={index} className="text-sm">{renderError(error)}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {result.warnings.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Warnings:</p>
              <ul className="list-disc list-inside space-y-1">
                {result.warnings.map((warning, index) => (
                  <li key={index} className="text-sm">{renderError(warning)}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {result.details.length > 0 && (
        <div className="space-y-2">
          <p className="font-medium">File Processing Details:</p>
          <div className="space-y-2">
            {result.details.map((detail, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <FileX className="h-4 w-4" />
                  <span className="text-sm font-medium">{detail.filename || `File ${index + 1}`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={detail.status === 'success' ? 'success' : detail.status === 'error' ? 'destructive' : 'warning'}>
                    {detail.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {detail.recordsProcessed} records
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
