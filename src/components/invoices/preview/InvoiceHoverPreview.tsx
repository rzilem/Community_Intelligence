
import React, { useEffect, useState } from 'react';
import { PreviewContent } from './PreviewContent';
import { Invoice } from '@/types/invoice-types';

interface InvoiceHoverPreviewProps {
  invoice: Invoice;
}

export const InvoiceHoverPreview: React.FC<InvoiceHoverPreviewProps> = ({ invoice }) => {
  const [normalizedUrl, setNormalizedUrl] = useState<string | undefined>(undefined);

  // Normalize the PDF URL if needed
  const normalizeUrl = (url?: string) => {
    if (!url) return undefined;
    
    try {
      // Create a URL object to validate the URL
      new URL(url);
      return url;
    } catch (e) {
      // If it's not a valid URL, try to add https://
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
      }
      console.error("Invalid URL format even after normalization:", url);
      return undefined;
    }
  };
  
  useEffect(() => {
    // Log information about the invoice for debugging
    console.group('InvoiceHoverPreview');
    console.log('Invoice ID:', invoice.id);
    console.log('PDF URL exists:', !!invoice.pdf_url);
    if (invoice.pdf_url) {
      console.log('PDF URL:', invoice.pdf_url);
    }
    console.log('HTML content exists:', !!invoice.html_content);
    console.groupEnd();

    // Normalize URL when invoice changes
    if (invoice.pdf_url) {
      setNormalizedUrl(normalizeUrl(invoice.pdf_url));
    } else {
      setNormalizedUrl(undefined);
    }
  }, [invoice]);

  return (
    <div className="w-full h-full">
      <PreviewContent 
        pdfUrl={normalizedUrl} 
        htmlContent={invoice.html_content} 
      />
    </div>
  );
};
