
import { useState, useEffect } from 'react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const hasHtmlContent = !!htmlContent && htmlContent.trim().length > 0;
  const hasEmailContent = !!emailContent && emailContent.trim().length > 0;
  const hasPdfUrl = !!pdfUrl && pdfUrl.trim().length > 0;

  const preferences = userPreferences || {
    preferredViewMode: 'auto',
    enableAutoFallback: true,
    enablePdfThumbnails: false,
    showValidationTools: true
  };

  // Simplified content type determination
  useEffect(() => {
    console.log('useEnhancedPdfPreview: Determining content type', {
      hasPdfUrl,
      hasHtmlContent,
      hasEmailContent,
      preferredMode: preferences.preferredViewMode
    });

    // Simple priority-based selection
    if (preferences.preferredViewMode === 'pdf' && hasPdfUrl) {
      setContentType('pdf');
    } else if (preferences.preferredViewMode === 'html' && hasHtmlContent) {
      setContentType('html');
    } else if (preferences.preferredViewMode === 'auto') {
      // Auto mode: prefer PDF, then HTML, then email
      if (hasPdfUrl) {
        setContentType('pdf');
      } else if (hasHtmlContent) {
        setContentType('html');
      } else if (hasEmailContent) {
        setContentType('email');
      } else {
        setContentType('none');
      }
    } else {
      setContentType('none');
    }
  }, [hasPdfUrl, hasHtmlContent, hasEmailContent, preferences.preferredViewMode]);

  const retryPdfLoad = () => {
    console.log('useEnhancedPdfPreview: Retry requested');
    setError(null);
    setIsLoading(true);
    // Simple retry - just clear error state
    setTimeout(() => setIsLoading(false), 1000);
  };

  const checkPdfAccessibility = () => {
    // Simplified - just assume PDF is accessible if URL exists
    return Promise.resolve(hasPdfUrl);
  };

  return {
    contentType,
    isLoading,
    error,
    pdfUrl: pdfUrl || '',
    pdfAccessible: hasPdfUrl,
    hasHtmlContent,
    hasEmailContent,
    retryCount: 0,
    retryPdfLoad,
    switchToHtml: () => setContentType('html'),
    switchToPdf: () => setContentType('pdf'),
    checkPdfAccessibility,
    progressiveEnhancement: false
  };
};
