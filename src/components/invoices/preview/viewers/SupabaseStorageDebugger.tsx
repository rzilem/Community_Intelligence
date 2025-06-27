
import React, { useState, useEffect } from 'react';
import { Info, Check, X, AlertTriangle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateStorageDebugInfo, type StorageDebugInfo } from '@/utils/supabase-storage-utils';
import { toast } from 'sonner';

interface SupabaseStorageDebuggerProps {
  pdfUrl: string;
}

export const SupabaseStorageDebugger: React.FC<SupabaseStorageDebuggerProps> = ({
  pdfUrl
}) => {
  const [debugInfo, setDebugInfo] = useState<StorageDebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDebugInfo = async () => {
      setIsLoading(true);
      try {
        const info = await generateStorageDebugInfo(pdfUrl);
        setDebugInfo(info);
      } catch (error) {
        console.error('Failed to load debug info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDebugInfo();
  }, [pdfUrl]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeTextString(text);
    toast.success('Copied to clipboard');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Storage Debug Information
          </CardTitle>
          <CardDescription>Loading debug information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!debugInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <X className="h-5 w-5 mr-2" />
            Debug Info Failed
          </CardTitle>
          <CardDescription>Could not load storage debug information</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Info className="h-5 w-5 mr-2" />
          Supabase Storage Debug
        </CardTitle>
        <CardDescription>
          Detailed information about PDF storage and access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Accessibility Status */}
        <div className="flex items-center justify-between">
          <span className="font-medium">File Accessible:</span>
          <Badge variant={debugInfo.isAccessible ? "default" : "destructive"}>
            {debugInfo.isAccessible ? (
              <><Check className="h-3 w-3 mr-1" /> Yes</>
            ) : (
              <><X className="h-3 w-3 mr-1" /> No</>
            )}
          </Badge>
        </div>

        {/* Storage Information */}
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-600">Bucket Name:</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                {debugInfo.bucketName || 'Unknown'}
              </code>
              {debugInfo.bucketName && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(debugInfo.bucketName!)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">File Path:</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded break-all">
                {debugInfo.filePath || 'Unknown'}
              </code>
              {debugInfo.filePath && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(debugInfo.filePath!)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* URL Information */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-600">Original URL:</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all flex-1">
                {debugInfo.originalUrl}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(debugInfo.originalUrl)}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {debugInfo.publicUrl && (
            <div>
              <label className="text-sm font-medium text-gray-600">Public URL:</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all flex-1">
                  {debugInfo.publicUrl}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(debugInfo.publicUrl!)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {debugInfo.signedUrl && (
            <div>
              <label className="text-sm font-medium text-gray-600">Signed URL:</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all flex-1">
                  {debugInfo.signedUrl}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(debugInfo.signedUrl!)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Errors */}
        {debugInfo.errors.length > 0 && (
          <div>
            <label className="text-sm font-medium text-red-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Errors:
            </label>
            <div className="mt-1 space-y-1">
              {debugInfo.errors.map((error, index) => (
                <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Actions */}
        <div className="pt-3 border-t">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(debugInfo.originalUrl, '_blank')}
            >
              Test Original URL
            </Button>
            {debugInfo.publicUrl && debugInfo.publicUrl !== debugInfo.originalUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(debugInfo.publicUrl!, '_blank')}
              >
                Test Public URL
              </Button>
            )}
            {debugInfo.signedUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(debugInfo.signedUrl!, '_blank')}
              >
                Test Signed URL
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
