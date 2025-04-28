
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

  // Pre-normalize the URL to fix double slashes
  const normalizeUrl = useCallback((url: string): string => {
    if (!url) return '';
    
    try {
      // For URLs with protocol, use URL parsing
      if (url.startsWith('http')) {
        const parsed = new URL(url);
        // Normalize pathname by replacing multiple slashes with a single one
        parsed.pathname = parsed.pathname.replace(/\/+/g, '/');
        return parsed.toString();
      }
      // For relative paths, just replace multiple slashes
      return url.replace(/\/+/g, '/');
    } catch (e) {
      console.error('Error normalizing URL in useDocumentViewer:', e);
      return url; // Return original if parsing fails
    }
  }, []);

  // Generate proxy URL only when dependencies change
  useEffect(() => {
    if (isPdf && pdfUrl) {
      try {
        // Pre-normalize the URL first to fix any double slashes
        const normalizedInputUrl = normalizeUrl(pdfUrl);
        
        // Check if URL has changed
        if (normalizedInputUrl !== originalUrl) {
          setOriginalUrl(normalizedInputUrl);
          console.log('PDF URL changed, generating new proxy URL');
          console.log('Original PDF URL:', pdfUrl);
          console.log('Normalized PDF URL:', normalizedInputUrl);
          
          // Check for and log any double slashes which might cause issues
          if (pdfUrl.includes('//') && !pdfUrl.includes('://')) {
            console.warn('⚠️ Double slash detected in PDF URL that may cause issues:', pdfUrl);
            console.log('This has been normalized to:', normalizedInputUrl);
          }
        }
        
        // Create proxy URL with normalized URL to ensure proper path handling
        const url = createProxyUrl(normalizedInputUrl, attempt);
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
  }, [pdfUrl, attempt, isPdf, originalUrl, normalizeUrl]);

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
