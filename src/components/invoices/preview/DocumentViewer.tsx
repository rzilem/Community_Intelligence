
import React, { useState } from 'react';
import { FileQuestion, RefreshCcw, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocumentViewer } from './hooks/useDocumentViewer';
import { toast } from 'sonner';
import { PdfPreview } from './PdfPreview';

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
  const [debugMode, setDebugMode] = useState(false);
  
  const {
    iframeError,
    loading,
    proxyUrl,
    originalUrl,
    handleIframeError,
    handleRetry
  } = useDocumentViewer({
    pdfUrl,
    isPdf,
    onIframeError,
    onIframeLoad
  });
  
  const handleDownload = () => {
    if (isPdf && pdfUrl) {
      let downloadUrl = pdfUrl;
      // If it's not an absolute URL, use the proxyUrl which should work for download
      if (!pdfUrl.startsWith('http') && proxyUrl) {
        downloadUrl = proxyUrl;
      }
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = pdfUrl.split('/').pop() || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    }
  };
  
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

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
        <div className="flex flex-wrap gap-2 justify-center">
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
          <Button onClick={toggleDebugMode} variant="outline" size="sm">
            {debugMode ? "Hide" : "Show"} Debug Info
          </Button>
        </div>
        
        {debugMode && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-xs max-w-md max-h-40 overflow-auto">
            <p className="font-bold">Original URL:</p>
            <p className="break-all mb-2">{originalUrl || "Not provided"}</p>
            <p className="font-bold">Proxy URL:</p>
            <p className="break-all mb-2">{proxyUrl || "Not generated"}</p>
            <p className="font-bold">Is PDF:</p>
            <p className="break-all">{String(isPdf)}</p>
          </div>
        )}
      </div>
    );
  }

  // Use the improved PdfPreview component
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 bg-white">
        <PdfPreview url={proxyUrl} onError={handleIframeError} />
      </div>
    </div>
  );
};
