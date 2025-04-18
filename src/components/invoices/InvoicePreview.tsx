
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { NoPreviewState } from './preview/NoPreviewState';
import { DocumentViewer } from './preview/DocumentViewer';
import { EmailPreview } from './preview/EmailPreview';
import { PreviewErrorState } from './preview/PreviewErrorState';
import { PreviewHeader } from './preview/PreviewHeader';
import { isValidUrl, normalizeUrl, isValidHtml, sanitizeHtml, isPdf, isImage, getFileExtension } from './preview/previewUtils';

interface InvoicePreviewProps {
  htmlContent?: string;
  pdfUrl?: string;
  emailContent?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  htmlContent, 
  pdfUrl,
  emailContent
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [normalizedPdfUrl, setNormalizedPdfUrl] = useState<string>('');
  const [hasContent, setHasContent] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('document');
  
  // Determine if the document is a Word document based on file extension
  const isWordDocument = getFileExtension(pdfUrl || '') === 'doc' || 
                          getFileExtension(pdfUrl || '') === 'docx';
  
  // Handle opening the document in a new tab
  const handleExternalOpen = () => {
    if (normalizedPdfUrl) {
      window.open(normalizedPdfUrl, '_blank');
    }
  };
  
  // Handle toggling fullscreen mode
  const handleToggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };
  
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

  if (!hasContent && !loading && !error) {
    return <NoPreviewState />;
  }

  if (error) {
    return <PreviewErrorState error={error} />;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PreviewHeader
        isPdf={isPdf(normalizedPdfUrl)}
        isWordDocument={isWordDocument}
        pdfUrl={normalizedPdfUrl}
        onExternalOpen={handleExternalOpen}
        onToggleFullscreen={handleToggleFullscreen}
        showActions={!!normalizedPdfUrl}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasEmail={!!emailContent}
      />
      
      <Tabs value={activeTab} className="flex-1 overflow-hidden">
        <TabsContent value="document" className="h-full m-0">
          <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900 h-full">
            {normalizedPdfUrl ? (
              <DocumentViewer 
                pdfUrl={normalizedPdfUrl}
                htmlContent={undefined}
                isPdf={isPdf(normalizedPdfUrl)}
                isWordDocument={isWordDocument}
                onIframeError={() => setError("Failed to load document")}
                onIframeLoad={() => setLoading(false)}
                onExternalOpen={handleExternalOpen}
              />
            ) : htmlContent && isValidHtml(htmlContent) ? (
              <div className="h-full">
                <div 
                  className="invoice-html-content h-full"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlContent) }} 
                />
              </div>
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
        </TabsContent>
        
        <TabsContent value="email" className="h-full m-0">
          <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900 h-full">
            <EmailPreview emailContent={emailContent} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
