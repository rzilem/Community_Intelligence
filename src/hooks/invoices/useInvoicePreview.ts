
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
  const [pdfAccessChecked, setPdfAccessChecked] = useState(false);
  
  useEffect(() => {
    console.group('InvoicePreview Component Debug');
    console.log('Props received:', {
      hasHtmlContent: !!htmlContent,
      htmlContentLength: htmlContent?.length || 0,
      pdfUrl: pdfUrl || 'none',
      pdfUrlValid: typeof pdfUrl === 'string' && pdfUrl.trim().length > 0
    });

    setPreviewError(null);
    setIsLoading(true);
    setPdfAccessChecked(false);

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
      
      // Check if the URL is accessible with both HEAD and GET methods
      const checkUrlAccess = async () => {
        try {
          // Try HEAD request first (lightweight)
          const headResponse = await fetch(urlToCheck, { 
            method: 'HEAD', 
            cache: 'no-store',
            headers: { 'Accept': 'application/pdf' } 
          });
          
          if (headResponse.ok) {
            console.log('PDF URL is accessible via HEAD:', urlToCheck);
            setContentType('pdf');
            setIsLoading(false);
            setPdfAccessChecked(true);
            return;
          }
          
          console.log('HEAD request failed, trying GET request as fallback');
          
          // If HEAD fails, try a direct GET request
          const getResponse = await fetch(urlToCheck, { 
            method: 'GET', 
            cache: 'no-store',
            headers: { 'Accept': 'application/pdf' } 
          });
          
          if (getResponse.ok) {
            console.log('PDF URL is accessible via GET:', urlToCheck);
            setContentType('pdf');
            setIsLoading(false);
            setPdfAccessChecked(true);
            return;
          }
          
          // Both HEAD and GET failed, try to use HTML content as fallback
          console.error('PDF URL inaccessible:', {
            status: getResponse.status,
            statusText: getResponse.statusText,
            url: pdfUrl
          });
          
          if (htmlContent) {
            console.log('Falling back to HTML content');
            setContentType('html');
          } else {
            setPreviewError(`Failed to access PDF (Status: ${getResponse.status})`);
            setContentType('none');
          }
          
        } catch (err: any) {
          console.error('Error accessing PDF URL:', err.message);
          
          if (htmlContent) {
            console.log('Error occurred, falling back to HTML content');
            setContentType('html');
          } else {
            setPreviewError(`Error accessing PDF: ${err.message}`);
            setContentType('none');
          }
        } finally {
          setIsLoading(false);
          setPdfAccessChecked(true);
          console.groupEnd();
        }
      };
      
      checkUrlAccess();
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
    pdfAccessChecked
  };
};
