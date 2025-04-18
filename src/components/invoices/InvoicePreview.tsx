
import React from 'react';
import { Card } from '@/components/ui/card';
import { PreviewHeader } from './preview/PreviewHeader';
import { DocumentViewer } from './preview/DocumentViewer';
import { PreviewErrorState } from './preview/PreviewErrorState';
import { NoPreviewState } from './preview/NoPreviewState';
import { EmptyState } from '@/components/ui/empty-state';
import { AlertCircle } from 'lucide-react';
import { useInvoicePreview } from '@/hooks/invoices/useInvoicePreview';
import { isInvoicePreviewable } from './preview/previewUtils';

interface InvoicePreviewProps {
  htmlContent?: string;
  pdfUrl?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ htmlContent, pdfUrl }) => {
  const {
    fullscreenPreview,
    setFullscreenPreview,
    previewError,
    setPreviewError,
    isLoading,
    setIsLoading,
    contentType,
    pdfMentioned,
  } = useInvoicePreview({ htmlContent, pdfUrl });

  const isPdf = pdfUrl?.toLowerCase().endsWith('.pdf') || false;
  const isWordDocument = pdfUrl?.toLowerCase().endsWith('.doc') || pdfUrl?.toLowerCase().endsWith('.docx') || false;

  const handleIframeError = () => {
    console.error('Iframe failed to load content:', {
      pdfUrl,
      isPdf,
      isWordDocument,
      hasHtmlContent: !!htmlContent
    });
    setIsLoading(false);
    
    if (!htmlContent && pdfUrl) {
      setPreviewError('Failed to load document preview. The file may be inaccessible or corrupted.');
    }
  };

  const handleIframeLoad = () => {
    console.log('Iframe content loaded successfully:', {
      pdfUrl,
      isPdf,
      hasHtmlContent: !!htmlContent
    });
    setIsLoading(false);
  };

  const openExternalLink = () => {
    if (pdfUrl) {
      console.log('Opening external link:', pdfUrl);
      window.open(pdfUrl, '_blank');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
          <p>Loading preview...</p>
        </div>
      );
    }

    if (previewError && !htmlContent) {
      return (
        <PreviewErrorState
          error={previewError}
          pdfUrl={pdfUrl}
          onExternalOpen={openExternalLink}
        />
      );
    }

    if (!htmlContent && !pdfUrl) {
      return (
        <EmptyState
          icon={<AlertCircle className="h-12 w-12" />}
          title="No preview available"
          description="No PDF or HTML content available for this invoice."
        />
      );
    }

    if (pdfMentioned && !pdfUrl && htmlContent) {
      return (
        <NoPreviewState
          message="PDF Attachment Mentioned But Not Available"
          pdfUrl={pdfUrl}
          onExternalOpen={pdfUrl ? openExternalLink : undefined}
        />
      );
    }

    if (contentType === 'html' && !isInvoicePreviewable(htmlContent)) {
      return (
        <NoPreviewState
          pdfUrl={pdfUrl}
          onExternalOpen={pdfUrl ? openExternalLink : undefined}
        />
      );
    }

    return (
      <DocumentViewer
        pdfUrl={pdfUrl}
        htmlContent={htmlContent}
        isPdf={isPdf}
        isWordDocument={isWordDocument}
        onIframeError={handleIframeError}
        onIframeLoad={handleIframeLoad}
        onExternalOpen={openExternalLink}
      />
    );
  };

  return (
    <Card className="h-full">
      <PreviewHeader
        isPdf={isPdf}
        isWordDocument={isWordDocument}
        pdfUrl={pdfUrl}
        onExternalOpen={openExternalLink}
        onToggleFullscreen={() => setFullscreenPreview(!fullscreenPreview)}
        showActions={!!(htmlContent || pdfUrl)}
      />
      <div className="p-0 h-[calc(100%-48px)] overflow-auto">
        {renderContent()}
      </div>
    </Card>
  );
};
