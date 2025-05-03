
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
  
  useEffect(() => {
    console.group('InvoicePreview Component');
    console.log('Props received:', {
      hasHtmlContent: !!htmlContent,
      htmlContentLength: htmlContent?.length || 0,
      pdfUrl: pdfUrl || 'none',
      pdfUrlValid: typeof pdfUrl === 'string' && pdfUrl.trim().length > 0
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

    // If we have a PDF URL, always check if it's accessible first
    if (pdfUrl && pdfUrl.trim() !== '') {
      console.log('Checking PDF URL accessibility:', pdfUrl);
      setContentType('pdf');
      
      // Handle different URL formats (including relative URLs)
      let urlToCheck = pdfUrl;
      if (pdfUrl.startsWith('/')) {
        urlToCheck = `${window.location.origin}${pdfUrl}`;
      } else if (!pdfUrl.startsWith('http://') && !pdfUrl.startsWith('https://')) {
        urlToCheck = `https://${pdfUrl}`;
      }
      
      console.log('Normalized URL for checking:', urlToCheck);
      
      // Check if the URL is accessible
      fetch(urlToCheck, { method: 'HEAD', cache: 'no-store' })
        .then((response) => {
          setIsLoading(false);
          if (!response.ok) {
            console.error('PDF URL inaccessible:', {
              status: response.status,
              statusText: response.statusText,
              url: pdfUrl
            });
            
            // Try a direct fetch instead of HEAD request as some servers might not support HEAD
            return fetch(urlToCheck, { cache: 'no-store' }).then(directResponse => {
              if (directResponse.ok) {
                console.log('PDF URL is accessible via direct GET:', pdfUrl);
                setContentType('pdf');
                return;
              }
              
              // Fallback to HTML content if available
              if (htmlContent) {
                console.log('PDF URL inaccessible but HTML content available, will use HTML instead');
                setContentType('html');
              } else {
                setPreviewError(`Failed to access PDF: ${response.statusText} (${response.status})`);
                setContentType('none');
              }
            });
          } else {
            console.log('PDF URL is accessible:', pdfUrl);
            setContentType('pdf');
          }
        })
        .catch((err) => {
          console.error('Error accessing PDF URL:', err.message, pdfUrl);
          setIsLoading(false);
          
          if (htmlContent) {
            console.log('PDF URL error but HTML content available, will use HTML instead');
            setContentType('html');
          } else {
            setPreviewError(`Error accessing PDF: ${err.message}`);
            setContentType('none');
          }
        });
    } else if (htmlContent) {
      console.log('No PDF URL provided, using HTML content for preview');
      setContentType('html');
      setIsLoading(false);
      console.groupEnd();
    } else {
      console.warn('Both PDF URL and HTML content are empty or invalid');
      setContentType('none');
      setIsLoading(false);
      console.groupEnd();
    }
  }, [htmlContent, pdfUrl]);

  return {
    fullscreenPreview,
    setFullscreenPreview,
    previewError,
    setPreviewError,
    isLoading,
    setIsLoading,
    contentType,
    pdfMentioned,
  };
};
