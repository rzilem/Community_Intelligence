
import React, { useState } from 'react';
import { ExternalLink, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedPdfViewerProps {
  pdfUrl: string;
  onExternalOpen: () => void;
  onError?: () => void;
}

export const EnhancedPdfViewer: React.FC<EnhancedPdfViewerProps> = ({
  pdfUrl,
  onExternalOpen,
  onError
}) => {
  const [displayError, setDisplayError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log('EnhancedPdfViewer: Attempting to display PDF:', pdfUrl);

  const handleObjectError = () => {
    console.error('EnhancedPdfViewer: PDF object failed to load');
    setDisplayError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleObjectLoad = () => {
    console.log('EnhancedPdfViewer: PDF object loaded successfully');
    setIsLoading(false);
    setDisplayError(false);
  };

  const handleRetry = () => {
    console.log('EnhancedPdfViewer: Retrying PDF load');
    setDisplayError(false);
    setIsLoading(true);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show error state immediately if PDF display is blocked
  if (displayError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">PDF Display Blocked</h3>
        <p className="text-center mb-4 text-muted-foreground max-w-md">
          Your browser has blocked the PDF preview for security reasons. 
          You can still view or download the document using the options below.
        </p>
        <div className="flex gap-2 flex-wrap justify-center">
          <Button onClick={onExternalOpen} className="flex items-center">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
          <Button variant="outline" onClick={handleDownload} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={handleRetry} className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Chrome and other browsers may block embedded PDFs for security. 
          Opening in a new tab usually works better.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onExternalOpen}
              className="mt-2 text-xs"
            >
              Or open in new tab
            </Button>
          </div>
        </div>
      )}
      
      {/* Use object tag instead of iframe for better browser compatibility */}
      <object
        data={pdfUrl}
        type="application/pdf"
        width="100%"
        height="100%"
        onLoad={handleObjectLoad}
        onError={handleObjectError}
        className="border-0"
      >
        {/* Fallback content when object fails */}
        <div className="flex flex-col items-center justify-center h-full p-6">
          <AlertTriangle className="h-8 w-8 text-amber-500 mb-3" />
          <p className="text-center text-muted-foreground mb-4">
            PDF preview not supported in this browser.
          </p>
          <div className="flex gap-2">
            <Button onClick={onExternalOpen} size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View PDF
            </Button>
            <Button variant="outline" onClick={handleDownload} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </object>
    </div>
  );
};
