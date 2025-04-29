
import { useState } from 'react';
import { normalizeUrl } from '../previewUtils';

/**
 * Custom hook to manage PDF URLs, keeping track of original, proxy, and normalized URLs.
 * @returns An object containing URL states and setter functions
 */
export function usePdfUrlManager() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  // Function to set PDF URL with normalization
  const setNormalizedPdfUrl = (url: string | null) => {
    if (!url) {
      setPdfUrl(null);
      return;
    }
    
    // Normalize URL to remove double slashes (excluding protocol://)
    let normalizedUrl = normalizeUrl(url);
    setPdfUrl(normalizedUrl);
  };

  return {
    pdfUrl,
    proxyUrl,
    originalUrl,
    setPdfUrl: setNormalizedPdfUrl,
    setProxyUrl,
    setOriginalUrl
  };
}
