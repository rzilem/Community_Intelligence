import { useState, useEffect, useCallback } from 'react';
import { isPdf, normalizeUrl } from '@/components/invoices/preview/utils';
import { showToast, showErrorToast } from '@/utils/toast-utils';
import { PDFPreviewOptions, PreviewContentType, PDFLoadStatus } from '@/types/invoice-view-types';

interface UseInvoicePreviewProps {
  pdfUrl?: string;
  htmlContent?: string;
  emailContent?: string;
}

export const useInvoicePreview = ({
  pdfUrl,
  htmlContent,
  emailContent
}: UseInvoicePreviewProps) => {
  const [activeTab, setActiveTab] = useState<string>('document');
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPdfLoaded, setIsPdfLoaded] = useState(false);
  const [contentType, setContentType] = useState<PreviewContentType>('none');
  const [pdfAccessible, setPdfAccessible] = useState<boolean | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Normalize the PDF URL if it exists
  const normalizedPdfUrl = pdfUrl ? normalizeUrl(pdfUrl) : '';
  const isPdfFile = pdfUrl ? isPdf(pdfUrl) : false;
  
  const hasHtmlContent = !!htmlContent && htmlContent.trim().length > 0;
  const hasEmailContent = !!emailContent && emailContent.trim().length > 0;
  
  // Check if PDF is accessible
  useEffect(() => {
    const checkPdfUrl = async () => {
      if (!normalizedPdfUrl) {
        setPdfAccessible(false);
        return;
      }
      
      try {
        console.log("Testing PDF accessibility for:", normalizedPdfUrl);
        
        // Try a HEAD request first
        try {
          const response = await fetch(normalizedPdfUrl, { 
            method: 'HEAD',
            cache: 'no-cache',
            headers: {
              'Pragma': 'no-cache',
              'Cache-Control': 'no-cache'
            }
          });
          
          const contentType = response.headers.get('content-type');
          const isValidPdf = response.ok && contentType?.includes('application/pdf');
          
          console.log("PDF accessibility test result:", {
            status: response.status,
            ok: response.ok,
            contentType,
            isValidPdf
          });
          
          setPdfAccessible(isValidPdf);
          
          if (!isValidPdf && response.ok) {
            console.warn("Resource is available but not a PDF");
          }
        } catch (error) {
          // If HEAD fails, try a simple GET
          console.warn("HEAD request failed, trying GET", error);
          const getResponse = await fetch(normalizedPdfUrl, { 
            method: 'GET', 
            cache: 'no-cache',
            headers: {
              'Pragma': 'no-cache',
              'Cache-Control': 'no-cache'
            }
          });
          
          const contentType = getResponse.headers.get('content-type');
          const isValidPdf = getResponse.ok && contentType?.includes('application/pdf');
          setPdfAccessible(isValidPdf);
        }
      } catch (error) {
        console.error("PDF accessibility checks failed:", {
          error,
          url: normalizedPdfUrl,
          retryCount,
          timestamp: new Date().toISOString()
        });
        
        // After multiple retries, assume inaccessible
        if (retryCount >= 2) {
          console.error("PDF accessibility check failed after retries");
          setPdfAccessible(false);
          
          if (hasHtmlContent) {
            console.log("Falling back to HTML content");
            setContentType('html');
          }
        } else {
          // Schedule a retry
          console.log("Scheduling retry for PDF accessibility check");
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000);
        }
      }
    };

    checkPdfUrl();
  }, [normalizedPdfUrl, hasHtmlContent, retryCount]);

  // Determine the content type to show
  useEffect(() => {
    console.log("Invoice Preview Data:", {
      hasPdfUrl: !!normalizedPdfUrl,
      normalizedPdfUrl: normalizedPdfUrl || 'none',
      hasHtmlContent,
      htmlContentLength: htmlContent?.length || 0,
      hasEmailContent,
      emailContentLength: emailContent?.length || 0,
      isPdfFile,
      contentType,
      isPdfAccessible: pdfAccessible
    });

    if (pdfAccessible && isPdfFile) {
      setContentType('pdf');
      setPreviewError(null);
    } else if (hasHtmlContent) {
      setContentType('html');
      setPreviewError(null);
    } else {
      setContentType('none');
    }
  }, [normalizedPdfUrl, hasHtmlContent, pdfAccessible, isPdfFile, htmlContent, emailContent, retryCount]);

  // Handle tab switching
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle PDF load error
  const handlePreviewError = useCallback(() => {
    console.error("Preview error:", {
      pdfUrl: normalizedPdfUrl,
      retryCount,
      hasHtmlContent,
      timestamp: new Date().toISOString()
    });
    setPreviewError("We couldn't display the document preview. Please try using the buttons below instead.");
    setIsPdfLoaded(false);
  }, [normalizedPdfUrl, retryCount, hasHtmlContent]);

  // Handle PDF load success
  const handlePreviewLoad = useCallback(() => {
    console.log("Preview loaded:", {
      pdfUrl: normalizedPdfUrl,
      contentType,
      timestamp: new Date().toISOString()
    });
    setIsPdfLoaded(true);
    setPreviewError(null);
  }, [normalizedPdfUrl, contentType]);

  // Handle external open action
  const handleExternalOpen = useCallback(() => {
    if (normalizedPdfUrl) {
      window.open(normalizedPdfUrl, '_blank');
      showToast("Opening PDF", {
        description: "The PDF is opening in a new tab",
      });
    }
  }, [normalizedPdfUrl]);

  // Toggle fullscreen view
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Retry loading the PDF
  const handleRetry = useCallback(() => {
    setPreviewError(null);
    setPdfAccessible(null); // Reset to trigger re-check
    setRetryCount(prev => prev + 1); // Increment retry count to trigger recheck
    showToast("Retrying", {
      description: "Attempting to reload the document preview"
    });
  }, []);

  useEffect(() => {
    // Default to document tab on load
    if (hasEmailContent) {
      // If we have email content and the document fails to load,
      // automatically switch to the email tab
      if (previewError && activeTab === 'document') {
        showErrorToast("Showing email content", {
          description: "Document preview failed. Showing original email instead."
        });
        setActiveTab('email');
      }
    }
  }, [previewError, hasEmailContent, activeTab]);

  return {
    activeTab,
    isPdf: isPdfFile,
    isWordDocument: false,
    isPdfLoaded,
    previewError,
    pdfUrl: normalizedPdfUrl,
    contentType,
    isFullscreen,
    hasEmailContent,
    handleTabChange,
    handlePreviewError,
    handlePreviewLoad,
    handleExternalOpen,
    toggleFullscreen,
    handleRetry,
  };
};
