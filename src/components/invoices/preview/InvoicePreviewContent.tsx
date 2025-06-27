
import React from 'react';
import { EnhancedStoragePdfViewer } from './viewers/EnhancedStoragePdfViewer';
import { EmailPreview } from './EmailPreview';
import { NoPreviewState } from './NoPreviewState';

interface InvoicePreviewContentProps {
  currentView: 'pdf' | 'html' | 'email';
  pdfUrl?: string;
  htmlContent?: string;
  emailContent?: string;
  hasPdf: boolean;
  hasHtml: boolean;
  hasEmail: boolean;
  onExternalOpen: () => void;
  onFallbackToHtml?: () => void;
}

export const InvoicePreviewContent: React.FC<InvoicePreviewContentProps> = React.memo(({
  currentView,
  pdfUrl,
  htmlContent,
  emailContent,
  hasPdf,
  hasHtml,
  hasEmail,
  onExternalOpen,
  onFallbackToHtml
}) => {
  console.log('InvoicePreviewContent: Rendering content for view:', currentView);

  switch (currentView) {
    case 'html':
      return hasHtml ? (
        <div className="p-6 overflow-auto h-full bg-white">
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      ) : (
        <NoPreviewState message="Processed content not available" />
      );
    
    case 'pdf':
      return hasPdf ? (
        <EnhancedStoragePdfViewer 
          pdfUrl={pdfUrl}
          onExternalOpen={onExternalOpen}
          onFallbackToHtml={onFallbackToHtml}
        />
      ) : (
        <NoPreviewState message="PDF not available" />
      );
    
    case 'email':
      return hasEmail ? (
        <EmailPreview emailContent={emailContent} />
      ) : (
        <NoPreviewState message="Original email not available" />
      );
    
    default:
      return <NoPreviewState message="No content available" />;
  }
});

InvoicePreviewContent.displayName = 'InvoicePreviewContent';
