
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
  const [viewerType, setViewerType] = useState<'direct' | 'pdfjs' | 'object' | 'embed'>('direct');

  // Generate the proxy URL
  const proxyUrl = isPdf ? createProxyUrl(pdfUrl, attempt) : pdfUrl;
  const { pdfJs: pdfJsUrl, googleDocs: googleDocsUrl } = createPdfViewerUrls(proxyUrl);

  // Log information for debugging
  useEffect(() => {
    if (isPdf) {
      console.log(`DocumentViewer Debug [${viewerType}]:`, {
        originalUrl: pdfUrl,
        proxyUrl,
        pdfJsUrl,
        attempt,
        viewerType,
        key
      });
      
      // Preflight check to see if PDF exists and is accessible
      const checkProxyUrl = async () => {
        try {
          const response = await fetch(proxyUrl, { 
            method: 'HEAD',
            cache: 'no-store'
          });
          console.log('PDF Proxy HEAD check:', {
            status: response.status,
            ok: response.ok,
            contentType: response.headers.get('content-type'),
            contentLength: response.headers.get('content-length')
          });
        } catch (err) {
          console.error('PDF Proxy HEAD check failed:', err);
        }
      };
      
      checkProxyUrl();
    }
  }, [pdfUrl, proxyUrl, attempt, viewerType, isPdf]);

  const handleIframeError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error(`Failed to load document [${viewerType}]:`, {
      proxyUrl,
      event: e,
      target: e.currentTarget?.src
    });
    
    setIframeError(true);
    setLoading(false);
    if (onIframeError) onIframeError();

    // Try different viewer types in sequence
    if (viewerType === 'direct') {
      console.log('Direct viewer failed, switching to PDF.js viewer');
      setViewerType('pdfjs');
      setLoading(true);
      setKey(Date.now());
    } else if (viewerType === 'pdfjs') {
      console.log('PDF.js viewer failed, switching to object tag');
      setViewerType('object');
      setLoading(true);
      setKey(Date.now());
    } else if (viewerType === 'object') {
      console.log('Object tag failed, switching to embed tag with Google Docs');
      setViewerType('embed');
      setLoading(true);
      setKey(Date.now());
    } else {
      console.error('All viewer types failed');
    }
  };

  const handleIframeLoad = () => {
    console.log(`Document loaded successfully [${viewerType}]`);
    setLoading(false);
    if (onIframeLoad) onIframeLoad();
  };

  const handleRetry = () => {
    console.log('Retrying with new attempt');
    setAttempt(prev => prev + 1);
    setIframeError(false);
    setLoading(true);
    setViewerType('direct');
    setKey(Date.now());
  };

  useEffect(() => {
    setKey(Date.now());
    setLoading(true);
    setIframeError(false);

    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn(`Loading timeout reached for: ${viewerType}`);
        setIframeError(true);
        setLoading(false);
      }
    }, 7000);

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
