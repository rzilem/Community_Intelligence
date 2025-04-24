
import React, { useState, useEffect } from 'react';
import { ExternalLink, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Invoice } from '@/types/invoice-types';

interface InvoiceHoverPreviewProps {
  invoice: Invoice;
}

export const InvoiceHoverPreview: React.FC<InvoiceHoverPreviewProps> = ({ invoice }) => {
  const [loadError, setLoadError] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [viewerType, setViewerType] = useState<'iframe' | 'object' | 'fallback'>('object');
  
  // Reset state when invoice changes
  useEffect(() => {
    setLoadError(false);
    setLoadAttempts(0);
    setViewerType('object');
  }, [invoice.id]);
  
  // Handle different viewer types based on load attempts
  useEffect(() => {
    if (loadAttempts === 1) {
      console.log('First PDF load attempt failed, trying iframe method');
      setViewerType('iframe');
    } else if (loadAttempts >= 2) {
      console.log('Both PDF load attempts failed, showing fallback view');
      setViewerType('fallback');
      setLoadError(true);
    }
  }, [loadAttempts]);
  
  const handleRetry = () => {
    setLoadError(false);
    setLoadAttempts(0);
    setViewerType('object');
  };
  
  // Handle opening the document in a new tab
  const handleExternalOpen = () => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (invoice.pdf_url) {
    if (loadError || viewerType === 'fallback') {
      return (
        <div className="w-[600px] h-[400px] flex flex-col items-center justify-center text-muted-foreground p-6 bg-white rounded-md">
          <FileText className="h-16 w-16 mb-4 text-red-500/50" />
          <p className="text-center mb-2 font-medium">Failed to load PDF preview</p>
          <p className="text-center text-sm mb-6">
            The PDF couldn't be displayed directly in the preview.
          </p>
          <div className="flex gap-3">
            <Button 
              variant="default" 
              onClick={handleExternalOpen} 
              className="flex items-center"
            >
              Open in new tab <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRetry} 
              className="flex items-center"
            >
              Retry <RefreshCw className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      );
    }

    if (viewerType === 'object') {
      return (
        <div className="w-[600px] h-[400px] relative bg-white">
          <object
            data={invoice.pdf_url}
            type="application/pdf"
            className="w-full h-full border-0"
            onError={() => {
              console.error("PDF object tag load error");
              setLoadAttempts(prev => prev + 1);
            }}
          >
            <p className="p-4">Unable to display PDF directly.</p>
          </object>
        </div>
      );
    }

    if (viewerType === 'iframe') {
      return (
        <div className="w-[600px] h-[400px] relative bg-white">
          <iframe
            src={invoice.pdf_url}
            className="w-full h-full border-0"
            title="PDF Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups"
            onLoad={() => console.log("PDF iframe loaded successfully")}
            onError={() => {
              console.error("PDF iframe loading error");
              setLoadAttempts(prev => prev + 1);
            }}
          />
        </div>
      );
    }
  }

  // Fallback to display HTML content if available
  if (invoice.html_content) {
    return (
      <div className="w-[600px] h-[400px] overflow-auto p-4 bg-white">
        <div dangerouslySetInnerHTML={{ __html: invoice.html_content }} />
      </div>
    );
  }

  // No preview available
  return (
    <div className="w-[600px] h-[400px] flex items-center justify-center text-muted-foreground bg-white">
      No preview available for this invoice
    </div>
  );
};
