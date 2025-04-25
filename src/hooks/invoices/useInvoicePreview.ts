
import { useState, useEffect } from 'react';

interface UseInvoicePreviewProps {
  htmlContent?: string;
  pdfUrl?: string;
}

export const useInvoicePreview = ({ htmlContent, pdfUrl }: UseInvoicePreviewProps) => {
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentType, setContentType] = useState<'html' | 'pdf' | 'doc' | 'none'>('none');
  const [pdfMentioned, setPdfMentioned] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [activeTab, setActiveTab] = useState('document');

  // Function to refresh the preview
  const refreshPreview = () => {
    setPreviewError(null);
    setIsLoading(true);
    setRefreshKey(Date.now());
  };

  useEffect(() => {
    console.group('InvoicePreview Component');
    console.log('Props received:', {
      hasHtmlContent: !!htmlContent,
      htmlContentLength: htmlContent?.length || 0,
      pdfUrl: pdfUrl || 'none',
      pdfUrlValid: typeof pdfUrl === 'string' && pdfUrl.trim().length > 0,
      refreshKey
    });

    setPreviewError(null);
    setIsLoading(true);

    // Check if HTML content mentions a PDF attachment
    if (htmlContent && !pdfUrl) {
      const pdfMentionRegex = /attach(ed|ment)|pdf|invoice|document/i;
      const containsPdfMention = pdfMentionRegex.test(htmlContent);
      setPdfMentioned(containsPdfMention);
      console.log('PDF mention detected in HTML:', containsPdfMention);
    }

    // First, determine what content we have to display
    if (!htmlContent && !pdfUrl) {
      console.warn('No preview content available (no HTML or PDF URL)');
      setContentType('none');
      setIsLoading(false);
      console.groupEnd();
      return;
    }

    // If we have a PDF URL, check if it's valid
    if (pdfUrl && pdfUrl.trim() !== '') {
      console.log('Setting content type to PDF for:', pdfUrl);
      setContentType('pdf');
      setIsLoading(false);
    } else if (htmlContent) {
      console.log('No PDF URL provided, using HTML content for preview');
      setContentType('html');
      setIsLoading(false);
    } else {
      console.warn('Both PDF URL and HTML content are empty or invalid');
      setContentType('none');
      setIsLoading(false);
    }
    
    console.groupEnd();
  }, [htmlContent, pdfUrl, refreshKey]);

  return {
    fullscreenPreview,
    setFullscreenPreview,
    previewError,
    setPreviewError,
    isLoading,
    setIsLoading,
    contentType,
    pdfMentioned,
    refreshPreview,
    refreshKey,
    activeTab,
    setActiveTab
  };
};
