
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertTriangle, RefreshCw, Download } from 'lucide-react';

interface PdfErrorProps {
  message: string;
  onExternalOpen: () => void;
  onFallbackToHtml?: () => void;
  onRetry: () => void;
}

export const PdfError: React.FC<PdfErrorProps> = ({
  message,
  onExternalOpen,
  onFallbackToHtml,
  onRetry
}) => (
  <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50">
    <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
    <h3 className="text-lg font-medium mb-2">PDF Display Failed</h3>
    <p className="text-center mb-4 text-muted-foreground max-w-md">
      {message}
    </p>
    <div className="flex gap-2 flex-wrap justify-center">
      <Button onClick={onExternalOpen} className="flex items-center">
        <ExternalLink className="h-4 w-4 mr-2" />
        Open in New Tab
      </Button>
      {onFallbackToHtml && (
        <Button variant="outline" onClick={onFallbackToHtml} className="flex items-center">
          View Processed Content
        </Button>
      )}
      <Button variant="outline" onClick={onRetry} className="flex items-center">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  </div>
);
