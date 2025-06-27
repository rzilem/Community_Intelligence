
/**
 * PDF-specific utility functions for handling PDF URLs and validation
 */

export const normalizePdfUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    // Handle relative URLs by converting to absolute
    let normalizedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      normalizedUrl = new URL(url, window.location.origin).href;
    }
    
    // Fix double slashes in path (but not in protocol)
    normalizedUrl = normalizedUrl.replace(/([^:])\/\/+/g, '$1/');
    
    // Add cache-busting parameter if URL contains query params already
    const urlObj = new URL(normalizedUrl);
    if (!urlObj.searchParams.has('t')) {
      urlObj.searchParams.set('t', Date.now().toString());
    }
    
    return urlObj.toString();
  } catch (error) {
    console.error('Error normalizing PDF URL:', error);
    return url;
  }
};

export const validatePdfUrl = async (url: string): Promise<boolean> => {
  if (!url) return false;
  
  try {
    const normalizedUrl = normalizePdfUrl(url);
    
    // Try HEAD request first for efficiency
    const response = await fetch(normalizedUrl, {
      method: 'HEAD',
      cache: 'no-cache',
      headers: {
        'Accept': 'application/pdf,*/*',
      }
    });
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      return contentType?.includes('application/pdf') || contentType?.includes('pdf') || true;
    }
    
    return false;
  } catch (error) {
    console.warn('PDF validation failed, but this might be due to CORS:', error);
    // Return true for CORS errors as the PDF might still be accessible in an iframe/object
    return true;
  }
};

export const createCacheBustedUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('cacheBust', Date.now().toString());
    return urlObj.toString();
  } catch (error) {
    return `${url}${url.includes('?') ? '&' : '?'}cacheBust=${Date.now()}`;
  }
};

export const isPdfAccessible = async (url: string, maxRetries: number = 2): Promise<boolean> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const testUrl = attempt > 0 ? createCacheBustedUrl(url) : normalizePdfUrl(url);
      const isValid = await validatePdfUrl(testUrl);
      
      if (isValid) return true;
      
      // Wait before retry
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    } catch (error) {
      console.warn(`PDF accessibility check attempt ${attempt + 1} failed:`, error);
    }
  }
  
  return false;
};
