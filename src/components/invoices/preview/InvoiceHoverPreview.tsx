
import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Invoice } from '@/types/invoice-types';

interface InvoiceHoverPreviewProps {
  invoice: Invoice;
}

export const InvoiceHoverPreview: React.FC<InvoiceHoverPreviewProps> = ({ invoice }) => {
  const [loadError, setLoadError] = useState(false);
  
  const handlePdfLoad = () => {
    console.log('PDF loaded successfully');
    setLoadError(false);
  };
  
  const handlePdfError = () => {
    console.log('PDF failed to load');
    setLoadError(true);
  };
  
  // Handle opening the document in a new tab
  const handleExternalOpen = () => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, '_blank');
    }
  };

  // First try to render using an object tag for better PDF compatibility
  if (invoice.pdf_url) {
    return (
      <div className="w-[600px] h-[400px] relative">
        {!loadError ? (
          <object
            data={invoice.pdf_url}
            type="application/pdf"
            className="w-full h-full border-0"
            onLoad={handlePdfLoad}
            onError={handlePdfError}
          >
            <iframe 
              src={invoice.pdf_url}
              className="w-full h-full border-0"
              title="PDF Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups"
            />
          </object>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
            <div className="text-center mb-4">
              <h3 className="font-medium text-lg">Error</h3>
              <p>Failed to load PDF document.</p>
            </div>
            <p className="text-center text-sm mb-6">
              Some PDFs cannot be displayed directly in the browser due to security restrictions.
            </p>
            <Button 
              variant="default" 
              onClick={handleExternalOpen} 
              className="flex items-center"
            >
              Open in new tab <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    );
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
    <div className="w-[600px] h-[400px] flex items-center justify-center text-muted-foreground">
      No preview available for this invoice
    </div>
  );
};
