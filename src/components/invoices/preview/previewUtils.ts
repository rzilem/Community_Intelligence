import DOMPurify from 'dompurify';

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Comprehensive URL normalization function that handles double slashes properly
export const normalizeUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    // Handle URLs with protocol (http/https)
    if (url.startsWith('http')) {
      const parsed = new URL(url);
      
      // Clean up the pathname by splitting by slashes, removing empty segments, and rejoining
      const pathSegments = parsed.pathname.split('/')
        .filter(segment => segment !== '');
      
      parsed.pathname = '/' + pathSegments.join('/');
      
      return parsed.toString();
    } 
    // For relative paths or storage paths
    else {
      // Remove leading slashes
      let normalized = url.replace(/^\/+/, '');
      // Replace multiple consecutive slashes with a single one
      normalized = normalized.replace(/\/+/g, '/');
      
      // Add protocol if needed for displaying in browser
      if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
        return 'https://' + normalized;
      }
      
      return normalized;
    }
  } catch (e) {
    console.error('Error normalizing URL:', e);
    return url; // Return original if parsing fails
  }
};

export const isValidHtml = (html: string): boolean => {
  if (!html) return false;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.innerHTML !== '';
};

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html);
};

export const isPdf = (urlOrFilename: string): boolean => {
  const lowerUrl = urlOrFilename.toLowerCase();
  return lowerUrl.endsWith('.pdf');
};

export const isImage = (urlOrFilename: string): boolean => {
  const lowerUrl = urlOrFilename.toLowerCase();
  return lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png') || lowerUrl.endsWith('.gif');
};

export const getFileExtension = (urlOrFilename: string): string => {
  if (!urlOrFilename) return '';
  
  // Extract the filename from the URL if it's a URL
  let filename = urlOrFilename;
  
  try {
    const url = new URL(urlOrFilename);
    filename = url.pathname.split('/').pop() || '';
  } catch (e) {
    // Not a URL, use as filename
  }
  
  // Extract extension
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop()?.toLowerCase() || '';
  }
  
  return '';
};
