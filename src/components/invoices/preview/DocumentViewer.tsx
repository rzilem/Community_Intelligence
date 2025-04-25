
import React, { useState, useEffect, useRef } from 'react';
import { FileQuestion, RefreshCcw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [iframeError, setIframeError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(Date.now()); // Force refresh key
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [attempt, setAttempt] = useState(1);
  const [viewerType, setViewerType] = useState<'direct' | 'pdfjs' | 'object'>('direct');

  // Create a proxy URL for PDFs to ensure they display inline
  const createProxyUrl = (url: string) => {
    if (!url) return '';
    
    // Extract just the filename from the URL
    let filename = url;
    
    // If it's a full URL, extract just the filename
    if (url.includes('://')) {
      try {
        const parsedUrl = new URL(url);
        filename = parsedUrl.pathname.split('/').pop() || '';
      } catch (e) {
        console.error('Failed to parse URL:', url, e);
        // Just take anything after the last slash if URL parsing fails
        filename = url.split('/').pop() || '';
      }
    } else if (url.includes('/')) {
      // If it has slashes but isn't a full URL, just take the last part
      filename = url.split('/').pop() || '';
    }
    
    console.log(`Creating proxy URL for: ${url}, filename: ${filename}`);
    // Add timestamp to prevent caching issues
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 10); // Add randomness
    const uniqueKey = `${timestamp}-${randomId}-${attempt}`;
    return `https://cahergndkwfqltxyikyr.supabase.co/functions/v1/pdf-proxy?pdf=${encodeURIComponent(filename)}&t=${uniqueKey}`;
  };

  const proxyUrl = isPdf ? createProxyUrl(pdfUrl) : pdfUrl;
  
  // For PDF.js viewer
  const pdfJsUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(proxyUrl)}`;

  const handleIframeError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error('Failed to load document in iframe:', e);
    setIframeError(true);
    setLoading(false);
    if (onIframeError) onIframeError();
    
    // Try to switch viewers if one fails
    if (viewerType === 'direct') {
      console.log('Direct viewing failed, switching to PDF.js');
      setViewerType('pdfjs');
      setLoading(true);
      setKey(Date.now());
    } else if (viewerType === 'pdfjs') {
      console.log('PDF.js viewing failed, switching to object tag');
      setViewerType('object');
      setLoading(true);
      setKey(Date.now());
    }
  };

  const handleIframeLoad = () => {
    console.log('Document loaded successfully in iframe');
    setLoading(false);
    if (onIframeLoad) onIframeLoad();
  };

  // Force refresh the iframe/object when the URL changes or on retry
  useEffect(() => {
    setKey(Date.now());
    setLoading(true);
    setIframeError(false);
    
    // Set a timeout to check if loading takes too long
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, trying alternate viewer');
        // Try cycling through different viewer types
        if (viewerType === 'direct') {
          setViewerType('pdfjs');
          setKey(Date.now());
        } else if (viewerType === 'pdfjs') {
          setViewerType('object');
          setKey(Date.now());
        } else if (viewerType === 'object') {
          // If all viewers timed out, show error
          setIframeError(true);
          setLoading(false);
        }
      }
    }, 5000);

    return () => clearTimeout(loadingTimeout);
  }, [pdfUrl, proxyUrl, attempt, viewerType]);

  // Add retry functionality
  const handleRetry = () => {
    setAttempt(prev => prev + 1);
    setIframeError(false);
    setLoading(true);
    setViewerType('direct'); // Reset to direct first
    setKey(Date.now());
  };

  if (isWordDocument) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-center mb-4">
          Word documents cannot be previewed directly in the browser.
        </p>
        {onExternalOpen && (
          <Button 
            onClick={onExternalOpen}
            className="text-primary hover:underline flex items-center"
          >
            Download document
          </Button>
        )}
      </div>
    );
  }

  if (iframeError) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-center mb-4">
          Unable to preview this document. The file may be corrupted or not supported.
        </p>
        <div className="flex gap-2">
          <Button 
            onClick={handleRetry}
            className="text-primary hover:underline flex items-center mr-4"
            variant="outline"
          >
            <RefreshCcw className="h-4 w-4 mr-2" /> Retry loading
          </Button>
          {onExternalOpen && (
            <Button 
              onClick={onExternalOpen}
              className="text-primary hover:underline flex items-center"
              variant="outline"
            >
              <ExternalLink className="h-4 w-4 mr-2" /> Open in new tab
            </Button>
          )}
        </div>
      </div>
    );
  }

  // For PDF files, use multiple rendering options based on the current viewerType
  if (isPdf) {
    // Loading indicator
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading document...</p>
          </div>
        </div>
      );
    }
    
    // Direct PDF in iframe (try first as it's fastest)
    if (viewerType === 'direct') {
      return (
        <div className="relative w-full h-full">
          <iframe
            ref={iframeRef}
            key={`direct-${key}`}
            className="w-full h-full border-0"
            src={proxyUrl}
            onError={handleIframeError}
            onLoad={handleIframeLoad}
            allowFullScreen
            title="PDF Preview"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-presentation"
          />
        </div>
      );
    }
    
    // PDF.js viewer (most compatible but slower)
    if (viewerType === 'pdfjs') {
      return (
        <div className="relative w-full h-full">
          <iframe
            ref={iframeRef}
            key={`pdfjs-${key}`}
            className="w-full h-full border-0"
            src={pdfJsUrl}
            onError={handleIframeError}
            onLoad={handleIframeLoad}
            allowFullScreen
            title="PDF.js Document Preview"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-presentation"
          />
        </div>
      );
    }
    
    // Object tag as last resort
    return (
      <div className="relative w-full h-full">
        <object
          key={`object-${key}`}
          className="w-full h-full"
          data={proxyUrl}
          type="application/pdf"
          title="PDF Document Preview"
        >
          <div className="flex flex-col items-center justify-center h-full p-4">
            <p className="mb-4 text-center">Unable to display PDF directly</p>
            {onExternalOpen && (
              <Button 
                onClick={onExternalOpen}
                variant="outline"
                className="flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" /> Open in new tab
              </Button>
            )}
          </div>
        </object>
      </div>
    );
  }

  // For HTML content
  return (
    <iframe
      key={key}
      className="w-full h-full border-0"
      src={proxyUrl}
      onError={handleIframeError}
      onLoad={handleIframeLoad}
      allow="fullscreen"
      title="Document Preview"
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-presentation"
    />
  );
};
