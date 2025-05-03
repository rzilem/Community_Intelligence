
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { NoPreviewState } from './preview/NoPreviewState';
import { DocumentViewer } from './preview/DocumentViewer';
import { EmailPreview } from './preview/EmailPreview';
import { PreviewErrorState } from './preview/PreviewErrorState';
import { PreviewHeader } from './preview/PreviewHeader';
import { 
  isValidUrl, 
  normalizeUrl, 
  isValidHtml, 
  sanitizeHtml, 
  isPdf, 
  isImage, 
  getFileExtension 
} from './preview/utils';
import { useInvoicePreview } from '@/hooks/invoices/useInvoicePreview';

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
  const {
    fullscreenPreview,
    setFullscreenPreview,
    previewError,
    setPreviewError,
    isLoading,
    setIsLoading,
    contentType,
    pdfMentioned,
    pdfAccessChecked
  } = useInvoicePreview({ htmlContent, pdfUrl });

  const [activeTab, setActiveTab] = useState<string>('document');
  const [normalizedPdfUrl, setNormalizedPdfUrl] = useState<string>('');
  
  // Check if we have valid email content to show the email tab
  const hasEmailContent = !!emailContent && emailContent.trim().length > 0;
  
  // Determine if the document is a Word document based on file extension
  const isWordDocument = getFileExtension(pdfUrl || '') === 'doc' || 
                          getFileExtension(pdfUrl || '') === 'docx';
  
  // Handle opening the document in a new tab
  const handleExternalOpen = useCallback(() => {
    if (normalizedPdfUrl) {
      console.log("Opening external URL:", normalizedPdfUrl);
      window.open(normalizedPdfUrl, '_blank', 'noopener,noreferrer');
    }
  }, [normalizedPdfUrl]);
  
  // Handle toggling fullscreen mode
  const handleToggleFullscreen = useCallback(() => {
    setFullscreenPreview(!fullscreenPreview);
  }, [fullscreenPreview, setFullscreenPreview]);
  
  useEffect(() => {
    // Validate and normalize PDF URL
    if (pdfUrl) {
      try {
        // Ensure URL has a protocol
        const normalizedUrl = normalizeUrl(pdfUrl);
        setNormalizedPdfUrl(normalizedUrl);
        
        // Log normalized URL for debugging
        console.log("Normalized PDF URL:", normalizedUrl);
      } catch (e) {
        console.error("Invalid PDF URL:", pdfUrl, e);
        setPreviewError("Invalid PDF URL format");
      }
    } else {
      setNormalizedPdfUrl('');
    }
    
    // Log for debugging
    console.log("Invoice Preview Data:", {
      hasPdfUrl: !!pdfUrl,
      normalizedPdfUrl: normalizedPdfUrl || "none",
      hasHtmlContent: !!htmlContent,
      htmlContentLength: htmlContent?.length || 0,
      hasEmailContent: !!emailContent,
      emailContentLength: emailContent?.length || 0,
      isPdfFile: isPdf(pdfUrl || ''),
      contentType
    });
  }, [pdfUrl, htmlContent, emailContent, contentType, setPreviewError]);

  // If no content and no email, show no preview state
  if ((!pdfUrl && !htmlContent && !hasEmailContent) || 
      (contentType === 'none' && pdfAccessChecked && !previewError && !hasEmailContent)) {
    return <NoPreviewState 
      pdfMentioned={pdfMentioned} 
      onExternalOpen={normalizedPdfUrl ? handleExternalOpen : undefined}
      pdfUrl={normalizedPdfUrl}
    />;
  }

  // If there's an error, show error state
  if (previewError && !hasEmailContent) {
    return <PreviewErrorState error={previewError} />;
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
        hasEmail={hasEmailContent}
      />
      
      <Tabs value={activeTab} className="flex-1 overflow-hidden">
        <TabsContent value="document" className="h-full m-0">
          <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900 h-full">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-pulse text-center">
                  <div className="h-8 w-8 mx-auto mb-4 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                  <div className="h-4 w-32 mx-auto rounded bg-gray-300 dark:bg-gray-700"></div>
                </div>
              </div>
            ) : contentType === 'pdf' && normalizedPdfUrl ? (
              <DocumentViewer 
                pdfUrl={normalizedPdfUrl}
                htmlContent={undefined}
                isPdf={isPdf(normalizedPdfUrl)}
                isWordDocument={isWordDocument}
                onIframeError={() => {
                  console.error("Failed to load document");
                  setIsLoading(false);
                }}
                onIframeLoad={() => {
                  console.log("Document loaded successfully");
                  setIsLoading(false);
                }}
                onExternalOpen={handleExternalOpen}
              />
            ) : contentType === 'html' && htmlContent && isValidHtml(htmlContent) ? (
              <div className="h-full">
                <div 
                  className="invoice-html-content h-full bg-white p-6 rounded-lg shadow"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlContent) }} 
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <Alert variant="destructive" className="max-w-md">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No preview available</AlertTitle>
                  <AlertDescription>
                    {previewError || "No valid PDF or HTML content is available for this invoice."}
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
