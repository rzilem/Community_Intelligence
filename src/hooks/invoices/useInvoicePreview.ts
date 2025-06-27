
import { useState, useEffect, useCallback } from 'react';
import { isPdf, normalizePdfUrl } from '@/components/invoices/preview/utils';
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
  const normalizedPdfUrl = pdfUrl ? normalizePdfUrl(pdfUrl) : '';
  const isPdfFile = pdfUrl ? isPdf(pdfUrl) : false;
  
  const hasHtmlContent = !!htmlContent && htmlContent.trim().length > 0;
  const hasEmailContent = !!emailContent && emailContent.trim().length > 0;
  
  // Simplified PDF accessibility check
  useEffect(() => {
    if (normalizedPdfUrl && isPdfFile) {
      setPdfAccessible(true); // Assume accessible, let browser handle it
      setContentType('pdf');
    } else if (hasHtmlContent) {
      setContentType('html');
    } else {
      setContentType('none');
    }
  }, [normalizedPdfUrl, hasHtmlContent, isPdfFile]);

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
    setPreviewError("PDF couldn't be displayed in browser. Use the external view button to open it in a new tab.");
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
    setRetryCount(prev => prev + 1);
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
