
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { PreviewHeader } from './preview/PreviewHeader';
import { DocumentViewer } from './preview/DocumentViewer';
import { PreviewErrorState } from './preview/PreviewErrorState';
import { NoPreviewState } from './preview/NoPreviewState';
import { EmptyState } from '@/components/ui/empty-state';
import { AlertCircle } from 'lucide-react';

interface InvoicePreviewProps {
  htmlContent?: string;
  pdfUrl?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ htmlContent, pdfUrl }) => {
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.group('InvoicePreview Component');
    console.log('Props received:', {
      hasHtmlContent: !!htmlContent,
      htmlContentLength: htmlContent?.length || 0,
      pdfUrl: pdfUrl || 'none',
      pdfUrlValid: typeof pdfUrl === 'string' && pdfUrl.trim().length > 0
    });

    setPreviewError(null);
    setIsLoading(false);

    if (!htmlContent && !pdfUrl) {
      console.warn('No preview content available (no HTML or PDF URL)');
      console.groupEnd();
      return;
    }

    // Only check PDF URL if one is provided
    if (pdfUrl && pdfUrl.trim() !== '') {
      console.log('Checking PDF URL accessibility:', pdfUrl);
      setIsLoading(true);
      
      // Test if the PDF URL is accessible
      fetch(pdfUrl, { method: 'HEAD' })
        .then((response) => {
          setIsLoading(false);
          if (!response.ok) {
            console.error('PDF URL inaccessible:', {
              status: response.status,
              statusText: response.statusText,
              url: pdfUrl
            });
            
            // If we have HTML content, no need to show an error
            if (htmlContent) {
              console.log('PDF URL inaccessible but HTML content available, will use HTML instead');
            } else {
              setPreviewError(`Failed to access PDF: ${response.statusText} (${response.status})`);
            }
          } else {
            console.log('PDF URL is accessible:', pdfUrl);
          }
        })
        .catch((err) => {
          console.error('Error accessing PDF URL:', err.message, pdfUrl);
          setIsLoading(false);
          
          // If we have HTML content, no need to show an error
          if (htmlContent) {
            console.log('PDF URL error but HTML content available, will use HTML instead');
          } else {
            setPreviewError(`Error accessing PDF: ${err.message}`);
          }
        })
        .finally(() => {
          console.groupEnd();
        });
    } else if (htmlContent) {
      console.log('No PDF URL provided, using HTML content for preview');
      console.groupEnd();
    } else {
      console.warn('Both PDF URL and HTML content are empty or invalid');
      console.groupEnd();
    }
  }, [htmlContent, pdfUrl]);

  const isWordDocument = pdfUrl?.toLowerCase().endsWith('.doc') || pdfUrl?.toLowerCase().endsWith('.docx') || false;
  const isPdf = pdfUrl?.toLowerCase().endsWith('.pdf') || false;

  const handleIframeError = () => {
    console.error('Iframe failed to load content:', {
      pdfUrl,
      isPdf,
      isWordDocument,
      hasHtmlContent: !!htmlContent
    });
    setIsLoading(false);
    
    // Only show error if we don't have an HTML fallback
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

    // Only show error state if we have no HTML content to fall back to
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
