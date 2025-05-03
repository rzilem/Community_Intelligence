
import { useState, useEffect } from 'react';
import { isPdf, normalizeUrl } from '@/components/invoices/preview/utils';
import { toast } from '@/hooks/use-toast';

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
  const [contentType, setContentType] = useState<'pdf' | 'html' | 'none'>('none');
  const [pdfAccessible, setPdfAccessible] = useState<boolean | null>(null);

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
      
      console.log("Checking PDF URL accessibility:", normalizedPdfUrl);
      console.log("Normalized URL for checking:", normalizedPdfUrl);
      
      try {
        console.log("Testing PDF accessibility for:", normalizedPdfUrl);
        const response = await fetch(normalizedPdfUrl, { 
          method: 'HEAD',
          mode: 'no-cors' 
        });
        
        console.log("PDF accessibility test result:", {
          status: response.status,
          ok: response.ok,
          contentType: response.headers.get('content-type')
        });
        
        setPdfAccessible(response.ok);
      } catch (error) {
        console.warn("GET request failed, trying alternative approach");
        
        // If fetch fails, try a different approach or fallback
        // For now, just assume it might be accessible if we have the URL
        setPdfAccessible(!!normalizedPdfUrl);
        
        if (hasHtmlContent) {
          console.log("Falling back to HTML content");
          setContentType('html');
        }
      }
    };

    checkPdfUrl();
  }, [normalizedPdfUrl, hasHtmlContent]);

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
      contentType
    });

    if (pdfAccessible && isPdfFile) {
      setContentType('pdf');
    } else if (hasHtmlContent) {
      setContentType('html');
    } else {
      setContentType('none');
    }
  }, [normalizedPdfUrl, hasHtmlContent, pdfAccessible, isPdfFile, htmlContent, emailContent]);

  // Handle tab switching
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle PDF load error
  const handlePreviewError = () => {
    setPreviewError("We couldn't display the invoice preview. Please try downloading the file instead.");
    setIsPdfLoaded(false);
  };

  // Handle PDF load success
  const handlePreviewLoad = () => {
    setIsPdfLoaded(true);
    setPreviewError(null);
  };

  // Handle external open action
  const handleExternalOpen = () => {
    if (normalizedPdfUrl) {
      window.open(normalizedPdfUrl, '_blank');
      toast({
        title: "Opening PDF",
        description: "The PDF is opening in a new tab",
      });
    }
  };

  // Toggle fullscreen view
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  // Retry loading the PDF
  const handleRetry = () => {
    setPreviewError(null);
    setPdfAccessible(null); // Reset to trigger re-check
  };

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
