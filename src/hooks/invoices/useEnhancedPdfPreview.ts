
import { useState, useEffect, useCallback } from 'react';
import { normalizePdfUrl, isPdfAccessible } from '@/components/invoices/preview/utils/pdfUtils';
import { showToast } from '@/utils/toast-utils';

interface UseEnhancedPdfPreviewProps {
  pdfUrl?: string;
  htmlContent?: string;
  emailContent?: string;
}

export const useEnhancedPdfPreview = ({
  pdfUrl,
  htmlContent,
  emailContent
}: UseEnhancedPdfPreviewProps) => {
  const [contentType, setContentType] = useState<'pdf' | 'html' | 'email' | 'none'>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfAccessible, setPdfAccessible] = useState<boolean | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [normalizedPdfUrl, setNormalizedPdfUrl] = useState<string>('');

  const hasHtmlContent = !!htmlContent && htmlContent.trim().length > 0;
  const hasEmailContent = !!emailContent && emailContent.trim().length > 0;

  // Normalize PDF URL on mount or when pdfUrl changes
  useEffect(() => {
    if (pdfUrl) {
      const normalized = normalizePdfUrl(pdfUrl);
      setNormalizedPdfUrl(normalized);
      console.log('PDF URL normalized:', { original: pdfUrl, normalized });
    } else {
      setNormalizedPdfUrl('');
    }
  }, [pdfUrl]);

  // Check PDF accessibility
  const checkPdfAccessibility = useCallback(async () => {
    if (!normalizedPdfUrl) {
      setPdfAccessible(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Checking PDF accessibility:', normalizedPdfUrl);
      const accessible = await isPdfAccessible(normalizedPdfUrl, 2);
      console.log('PDF accessibility result:', accessible);
      setPdfAccessible(accessible);
    } catch (error) {
      console.error('PDF accessibility check failed:', error);
      setPdfAccessible(false);
    } finally {
      setIsLoading(false);
    }
  }, [normalizedPdfUrl]);

  // Determine content type based on availability and accessibility
  useEffect(() => {
    const determineContentType = () => {
      console.log('Determining content type:', {
        pdfAccessible,
        hasHtmlContent,
        hasEmailContent,
        isLoading
      });

      if (isLoading) {
        setContentType('none');
        return;
      }

      // Priority: PDF (if accessible) > HTML > Email > None
      if (pdfAccessible && normalizedPdfUrl) {
        setContentType('pdf');
        setError(null);
      } else if (hasHtmlContent) {
        setContentType('html');
        setError(null);
        if (normalizedPdfUrl && pdfAccessible === false) {
          console.log('Falling back to HTML content due to PDF access issues');
        }
      } else if (hasEmailContent) {
        setContentType('email');
        setError(null);
      } else {
        setContentType('none');
        if (normalizedPdfUrl && pdfAccessible === false) {
          setError('PDF cannot be displayed. No alternative content available.');
        }
      }
    };

    determineContentType();
  }, [pdfAccessible, hasHtmlContent, hasEmailContent, isLoading, normalizedPdfUrl]);

  // Check accessibility when URL changes
  useEffect(() => {
    if (normalizedPdfUrl) {
      checkPdfAccessibility();
    } else {
      setPdfAccessible(false);
      setIsLoading(false);
    }
  }, [normalizedPdfUrl, checkPdfAccessibility]);

  const retryPdfLoad = useCallback(() => {
    console.log('Retrying PDF load, attempt:', retryCount + 1);
    setRetryCount(prev => prev + 1);
    setError(null);
    setPdfAccessible(null);
    
    // Add slight delay to prevent rapid retries
    setTimeout(() => {
      checkPdfAccessibility();
    }, 500);

    showToast('Retrying PDF load', {
      description: 'Attempting to reload the PDF document...'
    });
  }, [checkPdfAccessibility, retryCount]);

  const switchToHtml = useCallback(() => {
    if (hasHtmlContent) {
      setContentType('html');
      setError(null);
      showToast('Switched to HTML view', {
        description: 'Showing processed document content'
      });
    }
  }, [hasHtmlContent]);

  const switchToPdf = useCallback(() => {
    if (normalizedPdfUrl) {
      setContentType('pdf');
      setError(null);
    }
  }, [normalizedPdfUrl]);

  return {
    contentType,
    isLoading,
    error,
    pdfUrl: normalizedPdfUrl,
    pdfAccessible,
    hasHtmlContent,
    hasEmailContent,
    retryCount,
    retryPdfLoad,
    switchToHtml,
    switchToPdf,
    checkPdfAccessibility
  };
};
