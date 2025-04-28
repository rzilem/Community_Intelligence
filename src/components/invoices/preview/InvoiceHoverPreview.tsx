
import React from 'react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { DocumentViewer } from './DocumentViewer';
import { Invoice } from '@/types/invoice-types';

interface InvoiceHoverPreviewProps {
  invoice: Invoice;
  children: React.ReactNode;
}

export const InvoiceHoverPreview = ({ invoice, children }: InvoiceHoverPreviewProps) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-[800px] h-[600px] p-0">
        <DocumentViewer
          pdfUrl={invoice.pdf_url || ''}
          isPdf={true}
          onIframeError={() => console.error('Failed to load PDF preview')}
        />
      </HoverCardContent>
    </HoverCard>
  );
};
