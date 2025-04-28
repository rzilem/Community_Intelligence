
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
  
  // Use useCallback for handlers to prevent unnecessary re-renders
  const handleIframeError = useCallback(() => {
    console.error('PDF loading error:', {
      proxyUrl,
      timestamp: new Date().toISOString()
    });
    
    setIframeError(true);
    setLoading(false);
    if (onIframeError) onIframeError();
    
    if (attempt < 3) {
      setTimeout(() => {
        setAttempt(prev => prev + 1);
        setKey(Date.now());
      }, 1000);
    } else {
      toast.error('Failed to load PDF preview. Please try again or open in a new tab.');
    }
  }, [proxyUrl, attempt, onIframeError]);

  const handleIframeLoad = useCallback(() => {
    console.log('PDF loaded successfully:', {
      proxyUrl,
      timestamp: new Date().toISOString()
    });
    setLoading(false);
    setIframeError(false);
    if (onIframeLoad) onIframeLoad();
  }, [proxyUrl, onIframeLoad]);

  const handleRetry = useCallback(() => {
    console.log('Retrying PDF load...');
    setAttempt(prev => prev + 1);
    setIframeError(false);
    setLoading(true);
    setKey(Date.now());
  }, []);

  // Generate proxy URL only when dependencies change
  useEffect(() => {
    if (isPdf && pdfUrl) {
      try {
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
  }, [pdfUrl, attempt, isPdf]);

  return {
    iframeError,
    loading,
    key,
    proxyUrl,
    handleIframeError,
    handleIframeLoad,
    handleRetry
  };
};
