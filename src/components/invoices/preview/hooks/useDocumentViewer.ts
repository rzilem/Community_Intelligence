
import { useState, useEffect } from 'react';
import { createProxyUrl, createPdfViewerUrls } from '../utils/pdfUtils';
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
      const url = createProxyUrl(pdfUrl, attempt);
      console.log('Generated proxy URL:', url);
      setProxyUrl(url);
      setLoading(true);
      setIframeError(false);
    }
  }, [pdfUrl, attempt, isPdf]);

  const handleIframeError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error('PDF loading error:', {
      proxyUrl,
      event: e,
      target: e.currentTarget?.src,
      timestamp: new Date().toISOString()
    });
    
    setIframeError(true);
    setLoading(false);
    if (onIframeError) onIframeError();
    
    toast.error('Failed to load PDF preview. Please try again or open in a new tab.');
  };

  const handleIframeLoad = () => {
    console.log('PDF loaded successfully:', {
      proxyUrl,
      timestamp: new Date().toISOString()
    });
    setLoading(false);
    if (onIframeLoad) onIframeLoad();
  };

  const handleRetry = () => {
    console.log('Retrying PDF load...');
    setAttempt(prev => prev + 1);
    setIframeError(false);
    setLoading(true);
    setKey(Date.now());
  };

  // Add timeout for loading state
  useEffect(() => {
    if (!loading) return;
    
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('PDF loading timeout reached');
        setIframeError(true);
        setLoading(false);
        toast.error('PDF preview timed out. Please try again.');
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

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
