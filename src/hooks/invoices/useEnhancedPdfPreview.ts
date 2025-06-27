
import { useState, useEffect, useCallback } from 'react';
import { normalizePdfUrl, isPdfAccessible } from '@/components/invoices/preview/utils/pdfUtils';
import { showToast } from '@/utils/toast-utils';

interface UseEnhancedPdfPreviewProps {
  pdfUrl?: string;
  htmlContent?: string;
  emailContent?: string;
  userPreferences?: {
    preferredViewMode: 'pdf' | 'html' | 'auto';
    enableAutoFallback: boolean;
    enablePdfThumbnails: boolean;
    showValidationTools: boolean;
  };
}

export const useEnhancedPdfPreview = ({
  pdfUrl,
  htmlContent,
  emailContent,
  userPreferences
}: UseEnhancedPdfPreviewProps) => {
  const [contentType, setContentType] = useState<'pdf' | 'html' | 'email' | 'none'>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfAccessible, setPdfAccessible] = useState<boolean | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [normalizedPdfUrl, setNormalizedPdfUrl] = useState<string>('');
  const [progressiveEnhancement, setProgressiveEnhancement] = useState(false);

  const hasHtmlContent = !!htmlContent && htmlContent.trim().length > 0;
  const hasEmailContent = !!emailContent && emailContent.trim().length > 0;
  const preferences = userPreferences || {
    preferredViewMode: 'auto',
    enableAutoFallback: true,
    enablePdfThumbnails: false,
    showValidationTools: true
  };

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

  // Progressive enhancement: start with HTML if enabled
  useEffect(() => {
    if (preferences.preferredViewMode === 'auto' && hasHtmlContent && normalizedPdfUrl) {
      setProgressiveEnhancement(true);
      setContentType('html');
      setIsLoading(false);
      
      // Then check if PDF is available for upgrade
      checkPdfAccessibility();
    }
  }, [preferences.preferredViewMode, hasHtmlContent, normalizedPdfUrl]);

  // Check PDF accessibility with smart retry logic
  const checkPdfAccessibility = useCallback(async () => {
    if (!normalizedPdfUrl) {
      setPdfAccessible(false);
      setIsLoading(false);
      return;
    }

    try {
      console.log('Checking PDF accessibility:', normalizedPdfUrl);
      const accessible = await isPdfAccessible(normalizedPdfUrl, preferences.enableAutoFallback ? 3 : 2);
      console.log('PDF accessibility result:', accessible);
      setPdfAccessible(accessible);
      
      // Progressive enhancement: upgrade to PDF if available
      if (accessible && progressiveEnhancement) {
        showToast('PDF Available', {
          description: 'Upgraded to high-quality PDF view'
        });
        setContentType('pdf');
        setProgressiveEnhancement(false);
      }
      
    } catch (error) {
      console.error('PDF accessibility check failed:', error);
      setPdfAccessible(false);
      
      // Auto-fallback if enabled
      if (preferences.enableAutoFallback && hasHtmlContent) {
        console.log('Auto-fallback to HTML content enabled');
        setContentType('html');
        setError(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [normalizedPdfUrl, preferences.enableAutoFallback, hasHtmlContent, progressiveEnhancement]);

  // Determine content type based on user preferences and availability
  useEffect(() => {
    if (progressiveEnhancement) return; // Skip if using progressive enhancement
    
    const determineContentType = () => {
      console.log('Determining content type:', {
        preferredMode: preferences.preferredViewMode,
        pdfAccessible,
        hasHtmlContent,
        hasEmailContent,
        isLoading
      });

      if (isLoading) {
        return;
      }

      // User preference: Always PDF first
      if (preferences.preferredViewMode === 'pdf') {
        if (pdfAccessible && normalizedPdfUrl) {
          setContentType('pdf');
          setError(null);
          return;
        } else if (hasHtmlContent && preferences.enableAutoFallback) {
          setContentType('html');
          setError(null);
          return;
        }
      }

      // User preference: Always HTML first
      if (preferences.preferredViewMode === 'html') {
        if (hasHtmlContent) {
          setContentType('html');
          setError(null);
          return;
        } else if (pdfAccessible && normalizedPdfUrl) {
          setContentType('pdf');
          setError(null);
          return;
        }
      }

      // Auto mode: Smart detection
      if (preferences.preferredViewMode === 'auto') {
        if (pdfAccessible && normalizedPdfUrl) {
          setContentType('pdf');
          setError(null);
        } else if (hasHtmlContent) {
          setContentType('html');
          setError(null);
          if (normalizedPdfUrl && pdfAccessible === false) {
            console.log('Auto-fallback to HTML due to PDF access issues');
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
      }
    };

    determineContentType();
  }, [
    pdfAccessible, 
    hasHtmlContent, 
    hasEmailContent, 
    isLoading, 
    normalizedPdfUrl, 
    preferences,
    progressiveEnhancement
  ]);

  // Check accessibility when URL changes (but not during progressive enhancement)
  useEffect(() => {
    if (!progressiveEnhancement) {
      if (normalizedPdfUrl) {
        checkPdfAccessibility();
      } else {
        setPdfAccessible(false);
        setIsLoading(false);
      }
    }
  }, [normalizedPdfUrl, checkPdfAccessibility, progressiveEnhancement]);

  const retryPdfLoad = useCallback(() => {
    console.log('Retrying PDF load, attempt:', retryCount + 1);
    setRetryCount(prev => prev + 1);
    setError(null);
    setPdfAccessible(null);
    setIsLoading(true);
    
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
      setProgressiveEnhancement(false);
      showToast('Switched to HTML view', {
        description: 'Showing processed document content'
      });
    }
  }, [hasHtmlContent]);

  const switchToPdf = useCallback(() => {
    if (normalizedPdfUrl) {
      setContentType('pdf');
      setError(null);
      setProgressiveEnhancement(false);
      if (pdfAccessible === false) {
        retryPdfLoad();
      }
    }
  }, [normalizedPdfUrl, pdfAccessible, retryPdfLoad]);

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
    checkPdfAccessibility,
    progressiveEnhancement
  };
};
