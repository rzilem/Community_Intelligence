import DOMPurify from 'dompurify';

/**
 * Checks if a string is a valid URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    // Handle relative URLs as valid
    if (url.startsWith('/')) return true;
    
    // Test with URL constructor for absolute URLs
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Normalizes a URL by ensuring it has a protocol
 */
export const normalizeUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    // Handle relative URLs
    if (url.startsWith('/')) {
      // For relative URLs, convert to absolute using the current domain
      return `${window.location.origin}${url}`;
    }
    
    // Check if the URL already has a protocol
    if (url.match(/^https?:\/\//)) {
      return url;
    }
    
    // Try to parse the URL to see if it's valid
    try {
      new URL(`https://${url}`);
      return `https://${url}`;
    } catch {
      // If https fails, try with http
      try {
        new URL(`http://${url}`);
        return `http://${url}`;
      } catch {
        // If both fail, return the original URL
        console.warn('Could not normalize URL:', url);
        return url;
      }
    }
  } catch (e) {
    console.error('Error normalizing URL:', e);
    return url;
  }
};

/**
 * Checks if a string is valid HTML content
 */
export const isValidHtml = (html: string): boolean => {
  if (!html) return false;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    // Check if parsing produced valid HTML content
    return doc.body.innerHTML !== '' && 
           !doc.body.textContent?.includes('parsererror') &&
           !doc.body.innerHTML.includes('parsererror');
  } catch (e) {
    console.error("HTML validation error:", e);
    return false;
  }
};

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  try {
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ['style'],
      ADD_ATTR: ['target']
    });
  } catch (e) {
    console.error("HTML sanitization error:", e);
    return '';
  }
};

/**
 * Checks if a URL or filename refers to a PDF file
 */
export const isPdf = (urlOrFilename: string): boolean => {
  if (!urlOrFilename) return false;
  const lowerUrl = urlOrFilename.toLowerCase();
  
  // Check file extension
  if (lowerUrl.endsWith('.pdf')) return true;
  
  // Check content type
  if (lowerUrl.includes('application/pdf')) return true;
  
  // Check URL parameters that might indicate PDF
  if (lowerUrl.includes('pdf=true') || lowerUrl.includes('type=pdf')) return true;
  
  // Check for PDF viewer URLs
  if (lowerUrl.includes('viewer') && lowerUrl.includes('pdf')) return true;
  
  return false;
};

/**
 * Checks if a URL or filename refers to an image
 */
export const isImage = (urlOrFilename: string): boolean => {
  if (!urlOrFilename) return false;
  const lowerUrl = urlOrFilename.toLowerCase();
  return lowerUrl.endsWith('.jpg') || 
         lowerUrl.endsWith('.jpeg') || 
         lowerUrl.endsWith('.png') || 
         lowerUrl.endsWith('.gif') || 
         lowerUrl.endsWith('.bmp') || 
         lowerUrl.endsWith('.webp') ||
         lowerUrl.includes('image/');
};

/**
 * Extracts the file extension from a URL or filename
 */
export const getFileExtension = (urlOrFilename: string): string => {
  if (!urlOrFilename) return '';
  
  try {
    // Extract the filename from the URL if it's a URL
    let filename = urlOrFilename;
    
    // Parse URL if it looks like a URL
    if (urlOrFilename.includes('://') || urlOrFilename.startsWith('/')) {
      try {
        const url = new URL(urlOrFilename, window.location.origin);
        
        // First check if there's a download filename in the Content-Disposition
        const contentDisposition = url.searchParams.get('filename');
        if (contentDisposition) {
          filename = contentDisposition;
        } else {
          // Otherwise use the pathname
          const pathSegments = url.pathname.split('/');
          filename = pathSegments.pop() || '';
          
          // Remove any query parameters
          filename = filename.split('?')[0];
        }
      } catch (e) {
        // Not a valid URL, use as filename
        console.log("Not a valid URL, using as filename:", urlOrFilename);
      }
    }
    
    // Check for extensions in query strings
    if (filename.includes('?')) {
      const queryParams = new URLSearchParams(filename.split('?')[1]);
      const formatParam = queryParams.get('format') || queryParams.get('type');
      if (formatParam) {
        return formatParam.toLowerCase();
      }
    }
    
    // Extract extension from filename
    const parts = filename.split('.');
    if (parts.length > 1) {
      return parts.pop()?.toLowerCase() || '';
    }
    
    return '';
  } catch (e) {
    console.error("Error getting file extension:", e);
    return '';
  }
};

/**
 * Checks if a URL is accessible
 */
export const checkUrlAccessibility = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { 
      method: 'HEAD', 
      cache: 'no-store',
      headers: { 'Accept': 'application/pdf' }
    });
    return response.ok;
  } catch (e) {
    return false;
  }
};
