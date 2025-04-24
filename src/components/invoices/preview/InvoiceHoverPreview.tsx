
import React from 'react';
import { PreviewContent } from './PreviewContent';
import { Invoice } from '@/types/invoice-types';

interface InvoiceHoverPreviewProps {
  invoice: Invoice;
}

export const InvoiceHoverPreview: React.FC<InvoiceHoverPreviewProps> = ({ invoice }) => {
  return (
    <PreviewContent 
      pdfUrl={invoice.pdf_url} 
      htmlContent={invoice.html_content} 
    />
  );
};
