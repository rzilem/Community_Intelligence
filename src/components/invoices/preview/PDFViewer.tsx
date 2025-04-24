
import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  url: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ 
  url, 
  onLoad,
  onError 
}) => {
  const [viewerType, setViewerType] = useState<'object' | 'iframe'>('object');
  const [key, setKey] = useState(Date.now());
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setKey(Date.now());
    setFailed(false);
    setViewerType('object');
  }, [url]);

  const handleError = () => {
    if (viewerType === 'object') {
      setViewerType('iframe');
      setKey(Date.now());
    } else {
      setFailed(true);
      if (onError) onError();
    }
  };

  const handleRetry = () => {
    setKey(Date.now());
    setFailed(false);
    setViewerType('object');
  };

  const handleExternalOpen = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (failed) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-muted-foreground">
        <p className="text-center mb-4">Failed to load PDF preview</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetry} className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
          <Button onClick={handleExternalOpen} className="flex items-center">
            <ExternalLink className="h-4 w-4 mr-2" /> Open in new tab
          </Button>
        </div>
      </div>
    );
  }

  if (viewerType === 'object') {
    return (
      <object
        key={`pdf-object-${key}`}
        data={url}
        type="application/pdf"
        className="w-full h-full"
        onLoad={onLoad}
        onError={handleError}
      >
        <p>Unable to display PDF</p>
      </object>
    );
  }

  return (
    <iframe
      key={`pdf-iframe-${key}`}
      src={url}
      className="w-full h-full border-0"
      onLoad={onLoad}
      onError={handleError}
      sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups"
    />
  );
};
