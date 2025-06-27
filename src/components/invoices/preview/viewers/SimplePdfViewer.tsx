
import React, { useState } from 'react';
import { ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimplePdfViewerProps {
  pdfUrl: string;
  onExternalOpen: () => void;
}

export const SimplePdfViewer: React.FC<SimplePdfViewerProps> = ({
  pdfUrl,
  onExternalOpen
}) => {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log('SimplePdfViewer: Attempting to display PDF:', pdfUrl);

  const handleLoad = () => {
    console.log('SimplePdfViewer: PDF loaded successfully');
    setIsLoading(false);
    setLoadError(false);
  };

  const handleError = () => {
    console.error('SimplePdfViewer: PDF failed to load');
    setIsLoading(false);
    setLoadError(true);
  };

  const handleRetry = () => {
    console.log('SimplePdfViewer: Retrying PDF load');
    setLoadError(false);
    setIsLoading(true);
  };

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">PDF Display Issue</h3>
        <p className="text-center mb-4 text-muted-foreground">
          The PDF couldn't be displayed in the browser.
        </p>
        <div className="flex gap-2">
          <Button onClick={onExternalOpen} className="flex items-center">
            Open in New Tab <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={handleRetry} className="flex items-center">
            Try Again <RefreshCw className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
          </div>
        </div>
      )}
      
      <iframe
        src={pdfUrl}
        width="100%"
        height="100%"
        className="border-0"
        onLoad={handleLoad}
        onError={handleError}
        title="PDF Preview"
      />
    </div>
  );
};
