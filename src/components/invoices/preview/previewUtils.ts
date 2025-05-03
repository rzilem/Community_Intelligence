
import DOMPurify from 'dompurify';

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

export const normalizeUrl = (url: string): string => {
  if (!url) return '';
  
  // Handle relative URLs
  if (url.startsWith('/')) {
    // For relative URLs, convert to absolute using the current domain
    return `${window.location.origin}${url}`;
  }
  
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
};

export const isValidHtml = (html: string): boolean => {
  if (!html) return false;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    // Check if parsing produced valid HTML content
    return doc.body.innerHTML !== '' && 
           !doc.body.innerHTML.includes('parsererror');
  } catch (e) {
    console.error("HTML validation error:", e);
    return false;
  }
};

export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  try {
    return DOMPurify.sanitize(html);
  } catch (e) {
    console.error("HTML sanitization error:", e);
    return '';
  }
};

export const isPdf = (urlOrFilename: string): boolean => {
  if (!urlOrFilename) return false;
  const lowerUrl = urlOrFilename.toLowerCase();
  return lowerUrl.endsWith('.pdf') || lowerUrl.includes('application/pdf');
};

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

export const getFileExtension = (urlOrFilename: string): string => {
  if (!urlOrFilename) return '';
  
  // Extract the filename from the URL if it's a URL
  let filename = urlOrFilename;
  
  try {
    // Handle URL objects
    if (urlOrFilename.startsWith('http://') || 
        urlOrFilename.startsWith('https://') || 
        urlOrFilename.startsWith('/')) {
      const url = new URL(urlOrFilename, window.location.origin);
      const pathSegments = url.pathname.split('/');
      filename = pathSegments.pop() || '';
    }
  } catch (e) {
    // Not a URL, use as filename
    console.log("Not a valid URL, using as filename:", urlOrFilename);
  }
  
  // Extract extension
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop()?.toLowerCase() || '';
  }
  
  return '';
};
