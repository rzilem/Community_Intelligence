
import React from 'react';
import { FileQuestion, RefreshCcw, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  onRetry: () => void;
  onDownload?: () => void;
  onExternalOpen?: () => void;
  showDownload?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  onRetry,
  onDownload,
  onExternalOpen,
  showDownload
}) => (
  <div className="flex flex-col items-center justify-center h-full">
    <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
    <p className="text-center mb-4">
      Unable to preview this document. The file may be corrupted or not supported.
    </p>
    <div className="flex gap-2">
      <Button onClick={onRetry} variant="outline">
        <RefreshCcw className="h-4 w-4 mr-2" /> Retry
      </Button>
      {showDownload && onDownload && (
        <Button onClick={onDownload} variant="outline">
          <Download className="h-4 w-4 mr-2" /> Download
        </Button>
      )}
      {onExternalOpen && (
        <Button onClick={onExternalOpen} variant="outline">
          <ExternalLink className="h-4 w-4 mr-2" /> Open Original
        </Button>
      )}
    </div>
  </div>
);

