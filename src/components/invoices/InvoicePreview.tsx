
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
  const [contentType, setContentType] = useState<'html' | 'pdf' | 'doc' | 'none'>('none');

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

    // First, determine what content we have to display
    if (!htmlContent && !pdfUrl) {
      console.warn('No preview content available (no HTML or PDF URL)');
      setContentType('none');
      console.groupEnd();
      return;
    }

    // If we have a PDF URL, check if it's accessible
    if (pdfUrl && pdfUrl.trim() !== '') {
      console.log('Checking PDF URL accessibility:', pdfUrl);
      setIsLoading(true);
      setContentType('pdf');
      
      fetch(pdfUrl, { method: 'HEAD' })
        .then((response) => {
          setIsLoading(false);
          if (!response.ok) {
            console.error('PDF URL inaccessible:', {
              status: response.status,
              statusText: response.statusText,
              url: pdfUrl
            });
            
            // Fallback to HTML content if available
            if (htmlContent) {
              console.log('PDF URL inaccessible but HTML content available, will use HTML instead');
              setContentType('html');
            } else {
              setPreviewError(`Failed to access PDF: ${response.statusText} (${response.status})`);
              setContentType('none');
            }
          } else {
            console.log('PDF URL is accessible:', pdfUrl);
            setContentType('pdf');
          }
        })
        .catch((err) => {
          console.error('Error accessing PDF URL:', err.message, pdfUrl);
          setIsLoading(false);
          
          // Fallback to HTML content if available
          if (htmlContent) {
            console.log('PDF URL error but HTML content available, will use HTML instead');
            setContentType('html');
          } else {
            setPreviewError(`Error accessing PDF: ${err.message}`);
            setContentType('none');
          }
        })
        .finally(() => {
          console.groupEnd();
        });
    } else if (htmlContent) {
      console.log('No PDF URL provided, using HTML content for preview');
      setContentType('html');
      console.groupEnd();
    } else {
      console.warn('Both PDF URL and HTML content are empty or invalid');
      setContentType('none');
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

  const isInvoicePreviewable = (content?: string): boolean => {
    if (!content) return false;
    
    // Check if content seems to be a robots.txt or non-invoice content
    const lowerContent = content.toLowerCase();
    const nonInvoicePatterns = [
      /user-agent:/,
      /robots\.txt/,
      /sitemap:/,
      /disallow:/,
      /allow:\s*\//
    ];
    
    // Check if the content matches any non-invoice patterns
    const containsNonInvoiceContent = nonInvoicePatterns.some(pattern => pattern.test(lowerContent));
    
    // Check if the content might contain invoice-related terms
    const invoiceRelatedTerms = [
      /invoice/i,
      /total/i,
      /amount/i,
      /payment/i,
      /due date/i,
      /bill/i,
      /receipt/i
    ];
    
    const containsInvoiceTerms = invoiceRelatedTerms.some(term => term.test(content));
    
    // If it contains non-invoice patterns and doesn't have invoice-related terms, it's likely not an invoice
    if (containsNonInvoiceContent && !containsInvoiceTerms) {
      console.log('Content appears to be non-invoice related (possibly robots.txt or similar)');
      return false;
    }
    
    return true;
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

    // Check if HTML content seems to be a robots.txt or similar non-invoice content
    if (contentType === 'html' && !isInvoicePreviewable(htmlContent)) {
      return (
        <NoPreviewState />
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
