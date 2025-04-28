
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

  // Thoroughly normalize the URL to fix double slashes
  const normalizeUrl = useCallback((url: string): string => {
    if (!url) return '';
    
    try {
      console.log('Original URL before normalization:', url);
      
      // For URLs with protocol, use URL parsing for robust handling
      if (url.startsWith('http')) {
        const parsed = new URL(url);
        
        // Check for double slashes in pathname
        if (parsed.pathname.includes('//')) {
          console.warn('⚠️ Double slash detected in pathname:', parsed.pathname);
        }
        
        // Clean the pathname by:
        // 1. Split by slashes
        // 2. Filter out empty segments (which cause double slashes)
        // 3. Join with single slashes
        const pathParts = parsed.pathname.split('/')
          .filter(segment => segment !== '');
        
        // Reconstruct pathname with a single leading slash
        parsed.pathname = '/' + pathParts.join('/');
        
        const normalized = parsed.toString();
        console.log('Normalized URL result:', normalized);
        return normalized;
      }
      
      // For relative paths, handle more carefully
      // First remove leading slashes
      let normalized = url.replace(/^\/+/, '');
      // Then replace multiple consecutive slashes with a single one
      normalized = normalized.replace(/\/+/g, '/');
      
      console.log('Normalized relative path result:', normalized);
      return normalized;
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
