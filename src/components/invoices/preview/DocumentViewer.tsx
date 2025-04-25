
import React, { useState } from 'react';
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

  // Create a proxy URL for PDFs to ensure they display inline
  const proxyUrl = isPdf 
    ? `https://cahergndkwfqltxyikyr.supabase.co/functions/v1/pdf-proxy?pdf=${encodeURIComponent(pdfUrl.split('/').pop() || '')}`
    : pdfUrl;

  const handleIframeError = () => {
    console.error('Failed to load document in iframe:', proxyUrl);
    setIframeError(true);
    if (onIframeError) onIframeError();
  };

  const handleIframeLoad = () => {
    console.log('Document loaded successfully in iframe');
    if (onIframeLoad) onIframeLoad();
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
        {onExternalOpen && (
          <button 
            onClick={onExternalOpen}
            className="text-primary hover:underline flex items-center"
          >
            Try opening in a new tab
          </button>
        )}
      </div>
    );
  }

  return (
    <iframe
      className="w-full h-full border-0"
      src={proxyUrl}
      onError={handleIframeError}
      onLoad={handleIframeLoad}
      allow="fullscreen"
      title="Document Preview"
      sandbox="allow-same-origin allow-scripts allow-forms"
    />
  );
};
