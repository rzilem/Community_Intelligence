
import React, { useEffect } from 'react';
import { PreviewContent } from './PreviewContent';
import { Invoice } from '@/types/invoice-types';

interface InvoiceHoverPreviewProps {
  invoice: Invoice;
}

export const InvoiceHoverPreview: React.FC<InvoiceHoverPreviewProps> = ({ invoice }) => {
  // Log information about the invoice for debugging
  useEffect(() => {
    console.group('InvoiceHoverPreview');
    console.log('Invoice ID:', invoice.id);
    console.log('PDF URL exists:', !!invoice.pdf_url);
    if (invoice.pdf_url) {
      console.log('PDF URL:', invoice.pdf_url);
    }
    console.log('HTML content exists:', !!invoice.html_content);
    console.groupEnd();
  }, [invoice]);

  // Normalize the PDF URL if needed
  const normalizeUrl = (url?: string) => {
    if (!url) return undefined;
    
    // Ensure the URL starts with http:// or https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <PreviewContent 
      pdfUrl={normalizeUrl(invoice.pdf_url)} 
      htmlContent={invoice.html_content} 
    />
  );
};
