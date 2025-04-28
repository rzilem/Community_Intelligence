
import { useState, useEffect, useCallback } from 'react';
import { createProxyUrl } from '../utils/pdfUtils';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for signed URLs
const supabase = createClient(
  'https://cahergndkwfqltxyikyr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhaGVyZ25ka3dmcWx0eHlpa3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTUzMTYsImV4cCI6MjA1OTY3MTMxNn0.n_tRSJy3M9IaiyrhG02kpvko-pWd6XyYs4khDauxRGQ'
);

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
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState('');
  
  // Use useCallback for handlers to prevent unnecessary re-renders
  const handleIframeError = useCallback(() => {
    console.error('PDF loading error:', {
      url: signedUrl || proxyUrl,
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
  }, [signedUrl, proxyUrl, pdfUrl, attempt, onIframeError]);

  const handleIframeLoad = useCallback(() => {
    console.log('PDF loaded successfully:', {
      url: signedUrl || proxyUrl,
      originalUrl: pdfUrl,
      timestamp: new Date().toISOString()
    });
    setLoading(false);
    setIframeError(false);
    if (onIframeLoad) onIframeLoad();
  }, [signedUrl, proxyUrl, pdfUrl, onIframeLoad]);

  const handleRetry = useCallback(() => {
    console.log('Manually retrying PDF load...');
    setAttempt(prev => prev + 1);
    setIframeError(false);
    setLoading(true);
    setKey(Date.now());
    setSignedUrl(null); // Clear the signed URL to regenerate it
    
    // Toast to show user we're trying again
    toast.info('Retrying PDF load...');
  }, []);

  // Normalize URL to fix double slashes
  const normalizeUrl = useCallback((url: string): string => {
    if (!url) return '';
    
    try {
      console.log('Original URL before normalization:', url);
      
      // For URLs with protocol, use URL parsing for robust handling
      if (url.startsWith('http')) {
        const parsed = new URL(url);
        
        // Clean the pathname by filtering out empty segments
        const pathSegments = parsed.pathname.split('/')
          .filter(segment => segment !== '');
        
        parsed.pathname = '/' + pathSegments.join('/');
        
        return parsed.toString();
      }
      
      // For relative paths
      let normalized = url.replace(/^\/+/, '');
      normalized = normalized.replace(/\/+/g, '/');
      
      return normalized;
    } catch (e) {
      console.error('Error normalizing URL in useDocumentViewer:', e);
      return url; // Return original if parsing fails
    }
  }, []);

  // Generate signed URL for PDF files in Supabase storage
  const getSignedUrl = useCallback(async (url: string): Promise<string | null> => {
    try {
      // Only process Supabase storage URLs
      if (url.includes('supabase.co/storage/v1/object/public/')) {
        const normalizedUrl = normalizeUrl(url);
        
        // Extract bucket name and object path from URL
        const pathMatch = normalizedUrl.match(/\/public\/([^\/]+)\/(.+)/);
        if (pathMatch) {
          const bucketName = pathMatch[1];
          const objectPath = pathMatch[2];
          
          console.log(`Generating signed URL for bucket: ${bucketName}, path: ${objectPath}`);
          
          const { data, error } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(objectPath, 3600); // Valid for 1 hour
            
          if (error) {
            console.error('Error generating signed URL:', error);
            return null;
          }
          
          console.log('Generated signed URL successfully');
          return data?.signedUrl || null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }
  }, [normalizeUrl]);

  // Generate proxy URL or signed URL when dependencies change
  useEffect(() => {
    const generateUrls = async () => {
      if (isPdf && pdfUrl) {
        try {
          setLoading(true);
          
          // Pre-normalize the URL to fix any double slashes
          const normalizedInputUrl = normalizeUrl(pdfUrl);
          
          // Check if URL has changed
          if (normalizedInputUrl !== originalUrl) {
            setOriginalUrl(normalizedInputUrl);
            console.log('PDF URL changed, generating new URLs');
            console.log('Original PDF URL:', pdfUrl);
            console.log('Normalized PDF URL:', normalizedInputUrl);
          }
          
          // Try to generate a signed URL first (preferred method)
          const newSignedUrl = await getSignedUrl(normalizedInputUrl);
          
          if (newSignedUrl) {
            setSignedUrl(newSignedUrl);
            console.log('Using signed URL for PDF access:', newSignedUrl);
          } else {
            // Fallback to proxy URL if signed URL generation fails
            console.log('Signed URL generation failed, falling back to proxy URL');
            const url = createProxyUrl(normalizedInputUrl, attempt);
            console.log('Generated proxy URL fallback:', url);
            setProxyUrl(url);
          }
          
          setIframeError(false);
        } catch (error) {
          console.error('Error generating URLs:', error);
          setIframeError(true);
          setLoading(false);
        }
      }
    };
    
    generateUrls();
  }, [pdfUrl, attempt, isPdf, originalUrl, normalizeUrl, getSignedUrl]);

  // Return the URL to use - prefer signed URL if available
  const urlToUse = signedUrl || proxyUrl;

  return {
    iframeError,
    loading,
    key,
    proxyUrl: urlToUse, // Return the signed URL if available, otherwise proxy URL
    originalUrl: pdfUrl,
    handleIframeError,
    handleIframeLoad,
    handleRetry
  };
};
