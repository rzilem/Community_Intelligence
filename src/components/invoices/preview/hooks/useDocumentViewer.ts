
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

  const proxyUrl = isPdf ? createProxyUrl(pdfUrl, attempt) : pdfUrl;
  const { pdfJs: pdfJsUrl, googleDocs: googleDocsUrl } = createPdfViewerUrls(proxyUrl);

  const handleIframeError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error('Failed to load document:', proxyUrl, e);
    setIframeError(true);
    setLoading(false);
    if (onIframeError) onIframeError();

    if (viewerType === 'direct') {
      setViewerType('pdfjs');
      setLoading(true);
      setKey(Date.now());
    } else if (viewerType === 'pdfjs') {
      setViewerType('object');
      setLoading(true);
      setKey(Date.now());
    } else if (viewerType === 'object') {
      setViewerType('embed');
      setLoading(true);
      setKey(Date.now());
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
    if (onIframeLoad) onIframeLoad();
  };

  const handleRetry = () => {
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
        console.warn('Loading timeout reached for:', viewerType);
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

