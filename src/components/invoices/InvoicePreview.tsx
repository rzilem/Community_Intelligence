
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { PreviewHeader } from './preview/PreviewHeader';
import { DocumentViewer } from './preview/DocumentViewer';
import { PreviewErrorState } from './preview/PreviewErrorState';
import { NoPreviewState } from './preview/NoPreviewState';

interface InvoicePreviewProps {
  htmlContent?: string;
  pdfUrl?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ htmlContent, pdfUrl }) => {
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('InvoicePreview props:', {
      htmlContent: !!htmlContent,
      htmlContentLength: htmlContent?.length || 0,
      pdfUrl: pdfUrl || 'none',
    });

    if (!htmlContent && !pdfUrl) {
      setPreviewError('No PDF or HTML content available for this invoice.');
      return;
    }

    if (pdfUrl) {
      setIsLoading(true);
      fetch(pdfUrl, { method: 'HEAD' })
        .then((response) => {
          setIsLoading(false);
          if (!response.ok) {
            setPreviewError(`Failed to access PDF: ${response.statusText}`);
          } else {
            setPreviewError(null);
          }
        })
        .catch((err) => {
          setIsLoading(false);
          setPreviewError(`Error accessing PDF: ${err.message}`);
        });
    }
  }, [htmlContent, pdfUrl]);

  const isWordDocument = pdfUrl?.toLowerCase().endsWith('.doc') || pdfUrl?.toLowerCase().endsWith('.docx');
  const isPdf = pdfUrl?.toLowerCase().endsWith('.pdf');

  const handleIframeError = () => {
    console.error('Error loading iframe content');
    setIsLoading(false);
    setPreviewError('Failed to load document preview.');
  };

  const openExternalLink = () => {
    if (pdfUrl) {
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

    if (previewError) {
      return (
        <PreviewErrorState
          error={previewError}
          pdfUrl={pdfUrl}
          onExternalOpen={openExternalLink}
        />
      );
    }

    if (!htmlContent && !pdfUrl) {
      return <NoPreviewState />;
    }

    return (
      <DocumentViewer
        pdfUrl={pdfUrl}
        htmlContent={htmlContent}
        isPdf={isPdf}
        isWordDocument={isWordDocument}
        onIframeError={handleIframeError}
        onIframeLoad={() => setIsLoading(false)}
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
