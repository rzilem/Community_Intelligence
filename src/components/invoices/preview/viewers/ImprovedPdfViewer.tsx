
import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, AlertTriangle, Download, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImprovedPdfViewerProps {
  pdfUrl: string;
  onExternalOpen: () => void;
  onFallbackToHtml?: () => void;
}

export const ImprovedPdfViewer: React.FC<ImprovedPdfViewerProps> = ({
  pdfUrl,
  onExternalOpen,
  onFallbackToHtml
}) => {
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error' | 'timeout'>('loading');
  const [showFallbackSuggestion, setShowFallbackSuggestion] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Set a timeout to show fallback suggestion after 5 seconds
    timeoutRef.current = setTimeout(() => {
      if (loadingState === 'loading') {
        setLoadingState('timeout');
        setShowFallbackSuggestion(true);
      }
    }, 5000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loadingState]);

  const handleIframeLoad = () => {
    console.log('ImprovedPdfViewer: PDF loaded successfully');
    setLoadingState('loaded');
    setShowFallbackSuggestion(false);
  };

  const handleIframeError = () => {
    console.error('ImprovedPdfViewer: PDF failed to load');
    setLoadingState('error');
    setShowFallbackSuggestion(true);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'invoice.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRetry = () => {
    setLoadingState('loading');
    setShowFallbackSuggestion(false);
    
    // Force iframe reload
    if (iframeRef.current) {
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = pdfUrl;
        }
      }, 100);
    }
  };

  // Show error state for failed loads
  if (loadingState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">PDF Display Blocked</h3>
        <p className="text-center mb-4 text-muted-foreground max-w-md">
          Your browser blocked the PDF preview for security reasons. You can view the document using the options below.
        </p>
        <div className="flex gap-2 flex-wrap justify-center mb-4">
          <Button onClick={onExternalOpen} className="flex items-center">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
          <Button variant="outline" onClick={handleDownload} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {onFallbackToHtml && (
            <Button variant="outline" onClick={onFallbackToHtml} className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              View Processed Content
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Chrome and other browsers may block embedded PDFs for security. 
          The processed content view shows the same information in a more accessible format.
        </p>
      </div>
    );
  }

  // Show timeout state with fallback suggestion
  if (loadingState === 'timeout') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50">
        <Clock className="h-12 w-12 text-blue-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">PDF Taking Too Long</h3>
        <p className="text-center mb-4 text-muted-foreground max-w-md">
          The PDF is taking longer than expected to load. You can try viewing it externally or switch to the processed content.
        </p>
        <div className="flex gap-2 flex-wrap justify-center mb-4">
          <Button onClick={onExternalOpen} className="flex items-center">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
          {onFallbackToHtml && (
            <Button variant="default" onClick={onFallbackToHtml} className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              View Processed Content
            </Button>
          )}
          <Button variant="outline" onClick={handleRetry} className="flex items-center">
            Try Loading Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Loading overlay */}
      {loadingState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground mb-2">Loading PDF...</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onExternalOpen}
              className="text-xs"
            >
              Or open in new tab
            </Button>
          </div>
        </div>
      )}

      {/* Fallback suggestion alert */}
      {showFallbackSuggestion && onFallbackToHtml && (
        <Alert className="absolute top-4 left-4 right-4 z-20 bg-blue-50 border-blue-200">
          <FileText className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">Having trouble viewing the PDF? Try the processed content view for better compatibility.</span>
            <Button variant="outline" size="sm" onClick={onFallbackToHtml} className="ml-2">
              Switch to Processed View
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* PDF iframe */}
      <iframe
        ref={iframeRef}
        src={pdfUrl}
        width="100%"
        height="100%"
        className="border-0"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title="PDF Preview"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
};
