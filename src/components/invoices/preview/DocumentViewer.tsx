
import React, { useState, useEffect } from 'react';
import { FileQuestion, RefreshCcw, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createProxyUrl } from './utils/pdfUtils';

interface DocumentViewerProps {
  pdfUrl: string;
  htmlContent?: string;
  isPdf: boolean;
  isWordDocument?: boolean;
  onIframeError?: () => void;
  onIframeLoad?: () => void;
  onExternalOpen?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  pdfUrl,
  htmlContent,
  isPdf,
  isWordDocument = false,
  onIframeError,
  onIframeLoad,
  onExternalOpen
}) => {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [attempt, setAttempt] = useState(1); // For retry
  const [key] = useState(Date.now()); // Stable key for this instance

  // Generate the proxy URL - using our existing utility function
  const proxyUrl = isPdf ? createProxyUrl(pdfUrl, attempt) : pdfUrl;
  
  console.log('DEBUG - SimpleViewer:', {
    originalUrl: pdfUrl,
    proxyUrl: proxyUrl,
    isPdf,
    attempt,
    loadState
  });
  
  useEffect(() => {
    setLoadState('loading'); // Reset on url/attempt change
    
    // Add safety timeout
    const loadingTimeout = setTimeout(() => {
      if (loadState === 'loading') {
        console.warn('Loading timeout reached after 10 seconds');
        setLoadState('error');
        if (onIframeError) onIframeError();
      }
    }, 10000);
    
    return () => clearTimeout(loadingTimeout);
  }, [proxyUrl, attempt]); // Depend on proxyUrl and attempt count

  const handleLoad = () => {
    console.log('SimpleViewer: iframe loaded successfully.');
    setLoadState('loaded');
    if (onIframeLoad) onIframeLoad();
  };

  const handleError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error('SimpleViewer: iframe failed to load.', {
      event: e,
      target: e.currentTarget?.src
    });
    setLoadState('error');
    if (onIframeError) onIframeError();
  };

  const handleRetry = () => {
    console.log('SimpleViewer: Retrying with new attempt');
    setAttempt(prev => prev + 1);
  };

  const handleDownload = () => {
    if (isPdf && proxyUrl) {
      const link = document.createElement('a');
      link.href = proxyUrl;
      link.target = '_blank';
      link.download = pdfUrl.split('/').pop() || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle Word documents - maintain original behavior
  if (isWordDocument) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-center mb-4">Word documents cannot be previewed directly.</p>
        <p className="text-center text-sm text-muted-foreground mb-6">Please download and open in a compatible application.</p>
        {onExternalOpen && (
          <Button onClick={onExternalOpen} variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" /> Open Original
          </Button>
        )}
      </div>
    );
  }

  // HTML content render - maintain original behavior
  if (!isPdf && htmlContent) {
    return (
      <div className="h-full overflow-auto">
        <div 
          className="invoice-html-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />
      </div>
    );
  }

  // --- Render PDF Logic ---
  if (!isPdf || !proxyUrl) {
    return <div>No valid content to display.</div>;
  }

  if (loadState === 'loading') {
    return (
      <div className="relative w-full h-full">
        {/* Show loading overlay */}
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading document...</p>
          </div>
        </div>
        {/* Hidden iframe to attempt loading */}
        <iframe
          key={`pdf-frame-${key}-${attempt}`} // Change key on retry
          className="absolute top-0 left-0 w-1 h-1 opacity-0" // Hide iframe while loading
          src={proxyUrl}
          onLoad={handleLoad}
          onError={handleError}
          title="PDF Preview Loader"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-center mb-4">Failed to load PDF preview.</p>
        <div className="flex gap-2">
          <Button onClick={handleRetry} variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" /> Retry
          </Button>
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
          {onExternalOpen && (
            <Button onClick={onExternalOpen} variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" /> Open Original
            </Button>
          )}
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Proxy URL: {proxyUrl}</p>
        </div>
      </div>
    );
  }

  // If loaded successfully, show the iframe
  return (
    <div className="relative w-full h-full">
      <iframe
        key={`pdf-frame-${key}-${attempt}`} // Use same key as loader
        className="w-full h-full border-0"
        src={proxyUrl}
        title="PDF Preview"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
};
