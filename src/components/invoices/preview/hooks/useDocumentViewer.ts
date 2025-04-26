
import { useState, useEffect } from 'react';
import { createProxyUrl, createPdfViewerUrls } from '../utils/pdfUtils';

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
  
  // Simplified: Now we only use direct view mode
  const viewerType = 'direct';

  // Generate the proxy URL
  const proxyUrl = isPdf ? createProxyUrl(pdfUrl, attempt) : pdfUrl;
  const { pdfJs: pdfJsUrl, googleDocs: googleDocsUrl } = createPdfViewerUrls(proxyUrl);

  // Log information for debugging
  useEffect(() => {
    if (isPdf) {
      console.log(`DocumentViewer Debug [${viewerType}]:`, {
        originalUrl: pdfUrl,
        proxyUrl,
        attempt,
        viewerType,
        key,
        timestamp: new Date().toISOString()
      });
      
      // No preflight check - we'll let the iframe handle success/failure directly
    }
  }, [pdfUrl, proxyUrl, attempt, viewerType, isPdf, key]);

  const handleIframeError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error(`Failed to load document:`, {
      proxyUrl,
      event: e,
      target: e.currentTarget?.src,
      timestamp: new Date().toISOString()
    });
    
    // Simplified error handling - no switching between viewer types
    setIframeError(true);
    setLoading(false);
    if (onIframeError) onIframeError();
  };

  const handleIframeLoad = () => {
    console.log(`Document loaded successfully`, {
      timestamp: new Date().toISOString()
    });
    setLoading(false);
    if (onIframeLoad) onIframeLoad();
  };

  const handleRetry = () => {
    console.log('Retrying with new attempt');
    setAttempt(prev => prev + 1);
    setIframeError(false);
    setLoading(true);
    setKey(Date.now());
  };

  useEffect(() => {
    setKey(Date.now());
    setLoading(true);
    setIframeError(false);

    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn(`Loading timeout reached`, {
          timestamp: new Date().toISOString()
        });
        setIframeError(true);
        setLoading(false);
      }
    }, 10000); // Increased from 7s to 10s for more time

    return () => clearTimeout(loadingTimeout);
  }, [pdfUrl, attempt]);

  return {
    iframeError,
    loading,
    key,
    viewerType,
    proxyUrl,
    pdfJsUrl,
    googleDocsUrl,
    handleIframeError,
    handleIframeLoad,
    handleRetry
  };
};
