
import DOMPurify from 'dompurify';

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Enhanced normalizeUrl function that more aggressively handles slashes
export const normalizeUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    // For URLs with protocol, use URL parsing to fix path
    if (url.startsWith('http')) {
      // First fix the URL by parsing it
      const parsed = new URL(url);
      
      // Log suspicious double slashes in pathname for debugging
      if (parsed.pathname.includes('//')) {
        console.warn('Found double slashes in pathname that need fixing:', parsed.pathname);
      }
      
      // Fix double slashes in pathname - this is crucial
      parsed.pathname = parsed.pathname.split('/')
        .filter(segment => segment !== '') // Remove empty segments
        .join('/'); // Rejoin with single slashes
      
      // Ensure the pathname starts with a slash
      if (!parsed.pathname.startsWith('/')) {
        parsed.pathname = '/' + parsed.pathname;
      }
      
      return parsed.toString();
    } 
    // For relative paths, just normalize slashes
    else {
      // Remove leading slashes
      let normalizedPath = url.replace(/^\/+/, '');
      // Replace multiple consecutive slashes with a single one
      normalizedPath = normalizedPath.replace(/\/+/g, '/');
      
      // Ensure it has a protocol if needed
      if (!normalizedPath.startsWith('http://') && !normalizedPath.startsWith('https://')) {
        return 'https://' + normalizedPath;
      }
      
      return normalizedPath;
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
