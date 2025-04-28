
import { useState, useEffect, useCallback } from 'react';
import { createProxyUrl } from '../utils/pdfUtils';
import { toast } from 'sonner';

interface UseDocumentViewerProps {
  pdfUrl: string;
  isPdf: boolean;
  onIframeError?: () => void;
  onIframeLoad?: () => void;
}

export const useDocumentViewer = ({
  pdfUrl,
  isPdf,
  onIframeError,
  onIframeLoad
}: UseDocumentViewerProps) => {
  const [iframeError, setIframeError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(Date.now());
  const [attempt, setAttempt] = useState(1);
  const [proxyUrl, setProxyUrl] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  
  // Use useCallback for handlers to prevent unnecessary re-renders
  const handleIframeError = useCallback(() => {
    console.error('PDF loading error:', {
      proxyUrl,
      originalUrl: pdfUrl,
      timestamp: new Date().toISOString()
    });
    
    setIframeError(true);
    setLoading(false);
    if (onIframeError) onIframeError();
    
    if (attempt < 3) {
      console.log(`Retrying PDF load (attempt ${attempt + 1})`);
      setTimeout(() => {
        setAttempt(prev => prev + 1);
        setKey(Date.now());
      }, 1000);
    } else {
      toast.error('Failed to load PDF preview. Please check if the PDF exists in the storage bucket.');
    }
  }, [proxyUrl, pdfUrl, attempt, onIframeError]);

  const handleIframeLoad = useCallback(() => {
    console.log('PDF loaded successfully:', {
      proxyUrl,
      originalUrl: pdfUrl,
      timestamp: new Date().toISOString()
    });
    setLoading(false);
    setIframeError(false);
    if (onIframeLoad) onIframeLoad();
  }, [proxyUrl, pdfUrl, onIframeLoad]);

  const handleRetry = useCallback(() => {
    console.log('Manually retrying PDF load...');
    setAttempt(prev => prev + 1);
    setIframeError(false);
    setLoading(true);
    setKey(Date.now());
    
    // Toast to show user we're trying again
    toast.info('Retrying PDF load...');
  }, []);

  // Generate proxy URL only when dependencies change
  useEffect(() => {
    if (isPdf && pdfUrl) {
      try {
        // Check if URL has changed
        if (pdfUrl !== originalUrl) {
          setOriginalUrl(pdfUrl);
          console.log('PDF URL changed, generating new proxy URL');
          console.log('Original PDF URL:', pdfUrl);
          
          // Check for and log any double slashes which might cause issues
          if (pdfUrl.includes('//')) {
            const doubleSlashIndex = pdfUrl.indexOf('//');
            const protocolDoubleSlash = pdfUrl.indexOf('://');
            
            // Only log warning if double slash is not part of protocol (http://)
            if (doubleSlashIndex !== protocolDoubleSlash) {
              console.warn('⚠️ Double slash detected in PDF URL that may cause issues:', pdfUrl);
            }
          }
        }
        
        // Create proxy URL with full original URL to ensure proper path handling
        const url = createProxyUrl(pdfUrl, attempt);
        console.log('Generated proxy URL:', url);
        setProxyUrl(url);
        setLoading(true);
        setIframeError(false);
      } catch (error) {
        console.error('Error creating proxy URL:', error);
        setIframeError(true);
        setLoading(false);
      }
    }
  }, [pdfUrl, attempt, isPdf, originalUrl]);

  return {
    iframeError,
    loading,
    key,
    proxyUrl,
    originalUrl: pdfUrl,
    handleIframeError,
    handleIframeLoad,
    handleRetry
  };
};
