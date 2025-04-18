
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { NoPreviewState } from './preview/NoPreviewState';
import { DocumentViewer } from './preview/DocumentViewer';
import { PreviewErrorState } from './preview/PreviewErrorState';
import { PreviewHeader } from './preview/PreviewHeader';
import { isValidUrl, normalizeUrl, isValidHtml, sanitizeHtml, isPdf } from './preview/previewUtils';

interface InvoicePreviewProps {
  htmlContent?: string;
  pdfUrl?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  htmlContent, 
  pdfUrl 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [normalizedPdfUrl, setNormalizedPdfUrl] = useState<string>('');
  const [hasContent, setHasContent] = useState(false);
  
  useEffect(() => {
    // Reset states
    setLoading(false);
    setError(null);
    
    // Validate PDF URL
    if (pdfUrl) {
      try {
        // Normalize URL by ensuring it has a protocol
        const normalizedUrl = normalizeUrl(pdfUrl);
        setNormalizedPdfUrl(normalizedUrl);
        setHasContent(true);
      } catch (e) {
        console.error("Invalid PDF URL:", pdfUrl, e);
        setError("Invalid PDF URL format");
      }
    } else {
      setNormalizedPdfUrl('');
    }
    
    // Check if we have HTML content
    const validHtml = htmlContent && isValidHtml(htmlContent);
    
    // Update has content state
    setHasContent(!!normalizedPdfUrl || !!validHtml);
    
    // Log for debugging
    console.log("Invoice Preview Data:", {
      hasPdfUrl: !!pdfUrl,
      normalizedPdfUrl: normalizedPdfUrl || "none",
      hasHtmlContent: !!htmlContent,
      htmlContentLength: htmlContent?.length || 0,
      hasContent: hasContent,
      isPdfFile: isPdf(pdfUrl || '')
    });
  }, [htmlContent, pdfUrl]);

  // If no preview data is available, show the no preview state
  if (!hasContent && !loading && !error) {
    return <NoPreviewState />;
  }

  // If there's an error, show the error state
  if (error) {
    return <PreviewErrorState error={error} />;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PreviewHeader
        hasPdfUrl={!!normalizedPdfUrl}
        pdfUrl={normalizedPdfUrl}
      />
      
      <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
        {normalizedPdfUrl ? (
          <DocumentViewer url={normalizedPdfUrl} />
        ) : htmlContent && isValidHtml(htmlContent) ? (
          <Card className="p-4 h-full overflow-auto bg-white dark:bg-gray-800">
            <div 
              className="invoice-html-content"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlContent) }} 
            />
          </Card>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No preview available</AlertTitle>
              <AlertDescription>
                No valid PDF or HTML content is available for this invoice.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
};
