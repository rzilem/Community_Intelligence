
import React, { useState, useEffect } from 'react';
import { FileQuestion } from 'lucide-react';

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
  const [key, setKey] = useState(Date.now()); // Force refresh key

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
    return `https://cahergndkwfqltxyikyr.supabase.co/functions/v1/pdf-proxy?pdf=${encodeURIComponent(filename)}&t=${timestamp}`;
  };

  const proxyUrl = isPdf ? createProxyUrl(pdfUrl) : pdfUrl;

  const handleIframeError = () => {
    console.error('Failed to load document in iframe:', proxyUrl);
    setIframeError(true);
    if (onIframeError) onIframeError();
  };

  const handleIframeLoad = () => {
    console.log('Document loaded successfully in iframe');
    if (onIframeLoad) onIframeLoad();
  };

  // Force refresh the iframe/object when the URL changes
  useEffect(() => {
    setKey(Date.now());
  }, [pdfUrl, proxyUrl]);

  // Add retry functionality
  const handleRetry = () => {
    setIframeError(false);
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
          <button 
            onClick={onExternalOpen}
            className="text-primary hover:underline flex items-center"
          >
            Download document
          </button>
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
          <button 
            onClick={handleRetry}
            className="text-primary hover:underline flex items-center mr-4"
          >
            Retry loading
          </button>
          {onExternalOpen && (
            <button 
              onClick={onExternalOpen}
              className="text-primary hover:underline flex items-center"
            >
              Open in new tab
            </button>
          )}
        </div>
      </div>
    );
  }

  // For PDF files, use multiple rendering options to maximize compatibility
  if (isPdf) {
    // Try with PDF.js web viewer (a more robust option for PDF viewing)
    const pdfJsUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(proxyUrl)}`;
    
    return (
      <div className="relative w-full h-full">
        {/* First approach: PDF.js viewer (most compatible) */}
        <iframe
          key={`pdfjs-${key}`}
          className="w-full h-full border-0"
          src={pdfJsUrl}
          onError={handleIframeError}
          onLoad={handleIframeLoad}
          allowFullScreen
          title="PDF.js Document Preview"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-presentation"
        />
        
        {/* Fallback options hidden, will be shown if primary approach fails */}
        <object
          key={`object-${key}`}
          className="hidden"
          data={proxyUrl}
          type="application/pdf"
        >
          <iframe
            key={`iframe-${key}`}
            className="w-full h-full border-0"
            src={proxyUrl}
            allowFullScreen
            title="Document Preview Fallback"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-presentation"
          />
        </object>
      </div>
    );
  }

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
