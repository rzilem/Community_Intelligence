
import DOMPurify from 'dompurify';

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Enhanced normalizeUrl function that's more aggressive with double slashes
export const normalizeUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    // First fix double slashes in the path
    let normalizedUrl = url;
    
    // For URLs with protocol, use URL parsing to fix path
    if (url.startsWith('http')) {
      const parsed = new URL(url);
      // Normalize pathname by replacing multiple slashes with a single one
      parsed.pathname = parsed.pathname.replace(/\/+/g, '/');
      normalizedUrl = parsed.toString();
    } else {
      // For relative paths, just replace multiple slashes
      normalizedUrl = url.replace(/\/+/g, '/');
    }
    
    // Then ensure it has a protocol if missing
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      return 'https://' + normalizedUrl;
    }
    
    return normalizedUrl;
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
