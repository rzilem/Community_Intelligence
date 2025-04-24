
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
  const [attemptCount, setAttemptCount] = useState(0);

  // Log URL for debugging
  useEffect(() => {
    console.log(`PDFViewer attempting to load: ${url}`);
    console.log(`Current viewer type: ${viewerType}, attempt: ${attemptCount}`);
  }, [url, viewerType, attemptCount]);

  // Reset viewer when URL changes
  useEffect(() => {
    setKey(Date.now());
    setFailed(false);
    setViewerType('object');
    setAttemptCount(0);
  }, [url]);

  const handleError = () => {
    console.log(`PDF loading error with ${viewerType}, attempt ${attemptCount}`);
    
    if (viewerType === 'object') {
      console.log("Switching to iframe viewer");
      setViewerType('iframe');
      setKey(Date.now());
      setAttemptCount(prev => prev + 1);
    } else if (attemptCount < 2) {
      // Try one more time with iframe before giving up
      console.log("Retrying with iframe viewer");
      setKey(Date.now());
      setAttemptCount(prev => prev + 1);
    } else {
      console.log("All PDF loading attempts failed");
      setFailed(true);
      if (onError) onError();
    }
  };

  const handleRetry = () => {
    console.log("Manual retry requested for PDF viewer");
    setKey(Date.now());
    setFailed(false);
    setViewerType('object');
    setAttemptCount(0);
  };

  const handleExternalOpen = () => {
    console.log("Opening PDF in new tab:", url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLoad = () => {
    console.log(`PDF loaded successfully with ${viewerType}`);
    if (onLoad) onLoad();
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
        onLoad={handleLoad}
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
      onLoad={handleLoad}
      onError={handleError}
      sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups"
      referrerPolicy="no-referrer"
    />
  );
};
