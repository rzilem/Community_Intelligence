
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { generateStorageDebugInfo, type StorageDebugInfo } from '@/utils/supabase-storage-utils';

interface SupabaseStorageDebuggerProps {
  pdfUrl: string;
}

export const SupabaseStorageDebugger: React.FC<SupabaseStorageDebuggerProps> = ({ pdfUrl }) => {
  const [debugInfo, setDebugInfo] = useState<StorageDebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const loadDebugInfo = async () => {
      setIsLoading(true);
      try {
        const info = await generateStorageDebugInfo(pdfUrl);
        setDebugInfo(info);
      } catch (error) {
        console.error('Failed to generate debug info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDebugInfo();
  }, [pdfUrl]);

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Storage Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading debug information...</div>
        </CardContent>
      </Card>
    );
  }

  if (!debugInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Storage Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Failed to load debug information</p>
        </CardContent>
      </Card>
    );
  }

  const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleCopy(text, fieldName)}
      className="h-6 w-6 p-0"
    >
      {copiedField === fieldName ? (
        <CheckCircle className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          Storage Debug Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Accessibility Status */}
        <div className="flex items-center gap-2">
          <span className="font-medium">File Accessible:</span>
          {debugInfo.isAccessible ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Yes
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              No
            </Badge>
          )}
        </div>

        {/* Bucket and Path */}
        {debugInfo.bucketName && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Bucket:</span>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {debugInfo.bucketName}
                </code>
                <CopyButton text={debugInfo.bucketName} fieldName="bucket" />
              </div>
            </div>
            
            {debugInfo.filePath && (
              <div className="flex items-center justify-between">
                <span className="font-medium">File Path:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded max-w-xs truncate">
                    {debugInfo.filePath}
                  </code>
                  <CopyButton text={debugInfo.filePath} fieldName="path" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* URLs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Original URL:</span>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded max-w-xs truncate">
                {debugInfo.originalUrl}
              </code>
              <CopyButton text={debugInfo.originalUrl} fieldName="original" />
            </div>
          </div>

          {debugInfo.publicUrl && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Public URL:</span>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded max-w-xs truncate">
                  {debugInfo.publicUrl}
                </code>
                <CopyButton text={debugInfo.publicUrl} fieldName="public" />
              </div>
            </div>
          )}

          {debugInfo.signedUrl && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Signed URL:</span>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded max-w-xs truncate">
                  {debugInfo.signedUrl}
                </code>
                <CopyButton text={debugInfo.signedUrl} fieldName="signed" />
              </div>
            </div>
          )}
        </div>

        {/* Errors */}
        {debugInfo.errors.length > 0 && (
          <div className="space-y-2">
            <span className="font-medium text-red-600">Errors:</span>
            <div className="space-y-1">
              {debugInfo.errors.map((error, index) => (
                <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Actions */}
        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            <strong>Troubleshooting Tips:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>If the file is not accessible, check RLS policies on the storage bucket</li>
              <li>Try copying the signed URL above and opening it directly in a new tab</li>
              <li>Verify the file exists and hasn't been moved or deleted</li>
              <li>Check if the bucket is configured as public if needed</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
