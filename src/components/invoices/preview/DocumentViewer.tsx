
import React from 'react';
import { FileQuestion, RefreshCcw, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocumentViewer } from './hooks/useDocumentViewer';

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
  // Use the simplified hook
  const {
    iframeError,
    loading,
    key,
    proxyUrl,
    handleIframeError,
    handleIframeLoad,
    handleRetry
  } = useDocumentViewer({
    pdfUrl,
    isPdf,
    onIframeError,
    onIframeLoad
  });
  
  console.log('DocumentViewer render state:', { 
    isPdf, 
    isWordDocument, 
    loading, 
    iframeError,
    hasProxyUrl: !!proxyUrl,
    hasHtmlContent: !!htmlContent 
  });
  
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
  
  const handleOpenDirect = () => {
    if (proxyUrl) {
      window.open(proxyUrl, '_blank');
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

  // --- Simplified PDF Logic ---
  if (!isPdf || !proxyUrl) {
    return <div className="p-4 text-center text-muted-foreground">No valid content to display.</div>;
  }

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

  if (iframeError) {
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
          <Button onClick={handleOpenDirect} variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" /> Open in New Tab
          </Button>
          {onExternalOpen && (
            <Button onClick={onExternalOpen} variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" /> Open Original
            </Button>
          )}
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Debug: {proxyUrl}</p>
        </div>
      </div>
    );
  }

  // Only one view mode now - direct iframe
  return (
    <div className="relative w-full h-full">
      {/* Add a wrapper to help with cross-browser iframe sizing */}
      <div className="absolute inset-0 bg-white">
        <iframe
          key={`pdf-frame-${key}`}
          className="w-full h-full border-0"
          src={proxyUrl}
          title="PDF Preview"
          onError={handleIframeError}
          onLoad={handleIframeLoad}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  );
};
