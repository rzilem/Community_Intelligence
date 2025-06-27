
/**
 * Utility functions for invoice preview components
 */

export const isPdf = (url: string): boolean => {
  if (!url) return false;
  return url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('pdf');
};

export const getFileExtension = (url: string): string => {
  if (!url) return '';
  const parts = url.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
};

export const isWordDocument = (url: string): boolean => {
  const extension = getFileExtension(url);
  return ['doc', 'docx'].includes(extension);
};

export const normalizePdfUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    // If it's already an absolute URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Handle relative URLs
    return new URL(url, window.location.origin).href;
  } catch (e) {
    console.error('Error normalizing URL:', e);
    return url;
  }
};
