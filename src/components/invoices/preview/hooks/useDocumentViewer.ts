
import { useState, useEffect } from 'react';
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

  const handleIframeError = () => {
    console.error('PDF loading error:', {
      proxyUrl,
      timestamp: new Date().toISOString()
    });
    
    setIframeError(true);
    setLoading(false);
    if (onIframeError) onIframeError();
    
    if (attempt < 3) {
      // Auto-retry up to 3 times
      setTimeout(() => {
        setAttempt(prev => prev + 1);
        setKey(Date.now());
      }, 1000);
    } else {
      toast.error('Failed to load PDF preview. Please try again or open in a new tab.');
    }
  };

  const handleIframeLoad = () => {
    console.log('PDF loaded successfully:', {
      proxyUrl,
      timestamp: new Date().toISOString()
    });
    setLoading(false);
    setIframeError(false);
    if (onIframeLoad) onIframeLoad();
  };

  const handleRetry = () => {
    console.log('Retrying PDF load...');
    setAttempt(prev => prev + 1);
    setIframeError(false);
    setLoading(true);
    setKey(Date.now());
  };

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
