
import React, { lazy, Suspense } from 'react';
import { Invoice } from '@/types/invoice-types';

// Lazy load the preview component for better performance
const EnhancedInvoicePreview = lazy(() => import('../EnhancedInvoicePreview'));

interface InvoicePreviewSectionProps {
  invoice: Invoice;
}

const PreviewFallback = () => (
  <div className="h-[400px] flex items-center justify-center bg-muted/10 rounded-lg">
    <div className="text-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
      <p className="text-sm text-muted-foreground">Loading preview...</p>
    </div>
  </div>
);

export const InvoicePreviewSection: React.FC<InvoicePreviewSectionProps> = React.memo(({
  invoice
}) => {
  return (
    <Suspense fallback={<PreviewFallback />}>
      <EnhancedInvoicePreview
        pdfUrl={invoice.pdf_url}
        htmlContent={invoice.html_content}
        emailContent={invoice.email_content}
      />
    </Suspense>
  );
});

InvoicePreviewSection.displayName = 'InvoicePreviewSection';
