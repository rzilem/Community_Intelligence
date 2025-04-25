
import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  url: string;
  onLoad?: () => void;
  onError?: () => void;
  onRetry?: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ 
  url, 
  onLoad,
  onError,
  onRetry
}) => {
  const [viewerType, setViewerType] = useState<'object' | 'iframe' | 'fallback'>('object');
  const [key, setKey] = useState(Date.now());
  const [failed, setFailed] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [loadStartTime, setLoadStartTime] = useState(Date.now());

  // Get the proxy URL for a PDF
  const getProxyUrl = useCallback((originalUrl: string) => {
    const proxyEndpoint = 'https://cahergndkwfqltxyikyr.supabase.co/functions/v1/pdf-proxy';
    return `${proxyEndpoint}?url=${encodeURIComponent(originalUrl)}`;
  }, []);

  // Reset state when URL changes
  useEffect(() => {
    console.log(`PDFViewer attempting to load: ${url}`);
    setKey(Date.now());
    setFailed(false);
    setViewerType('object');
    setAttemptCount(0);
    setLoadStartTime(Date.now());
  }, [url]);
  
  // Log details when viewerType or attemptCount changes
  useEffect(() => {
    console.log(`Current viewer type: ${viewerType}, attempt: ${attemptCount}`);
  }, [viewerType, attemptCount]);

  // Timeout handler to prevent infinite loading state
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!failed && viewerType === 'object') {
        console.log("PDF loading timeout - switching to iframe");
        setViewerType('iframe');
        setKey(Date.now());
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [viewerType, failed, loadStartTime]);

  const handleError = useCallback(() => {
    console.log(`PDF loading error with ${viewerType}, attempt ${attemptCount}`);
    
    if (viewerType === 'object') {
      console.log("Switching to iframe viewer");
      setViewerType('iframe');
      setKey(Date.now());
      setAttemptCount(prev => prev + 1);
    } else if (attemptCount < 2) {
      console.log("Retrying with iframe viewer");
      setKey(Date.now());
      setAttemptCount(prev => prev + 1);
    } else {
      console.log("All PDF loading attempts failed");
      setFailed(true);
      if (onError) onError();
    }
  }, [viewerType, attemptCount, onError]);

  const handleLoad = useCallback(() => {
    console.log(`PDF loaded successfully with ${viewerType}`);
    setFailed(false);
    if (onLoad) onLoad();
  }, [viewerType, onLoad]);

  const handleRetry = useCallback(() => {
    console.log("Manual retry requested");
    setKey(Date.now());
    setFailed(false);
    setViewerType('object');
    setAttemptCount(0);
    setLoadStartTime(Date.now());
    if (onRetry) onRetry();
  }, [onRetry]);

  const handleExternalOpen = useCallback(() => {
    console.log("Opening PDF in new tab:", url);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [url]);

  if (failed) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mb-4 text-red-400" />
        <p className="text-center mb-2">Failed to load PDF preview</p>
        <p className="text-center text-sm mb-4">
          The PDF may be set to download by the server instead of displaying inline.
        </p>
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

  const proxyUrl = getProxyUrl(url);
  console.log('Using proxy URL:', proxyUrl);

  if (viewerType === 'object') {
    return (
      <object
        key={`pdf-object-${key}`}
        data={proxyUrl}
        type="application/pdf"
        className="w-full h-full"
        onLoad={handleLoad}
        onError={handleError}
      >
        <p>Unable to display PDF</p>
      </object>
    );
  }

  // Always include security attributes for iframe
  return (
    <iframe
      key={`pdf-iframe-${key}`}
      src={proxyUrl}
      className="w-full h-full border-0"
      onLoad={handleLoad}
      onError={handleError}
      sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups"
      referrerPolicy="no-referrer"
      title="PDF Document"
    />
  );
};
