
import DOMPurify from 'dompurify';

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

export const normalizeUrl = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
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
