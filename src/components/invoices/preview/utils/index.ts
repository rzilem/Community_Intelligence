
// Export all utility functions for easy importing
export * from './fileInfoUtils';
export * from './fileTypeUtils';
export * from './htmlUtils';
export * from './urlUtils';

// Additional utility functions for document handling
export const isPdf = (url: string): boolean => {
  if (!url) return false;
  return url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('pdf');
};

export const getFileExtension = (url: string): string => {
  if (!url) return '';
  const parts = url.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

export const normalizeUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    // If it's already an absolute URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url.replace(/([^:])\/\/+/g, '$1/');
    }
    
    // Handle relative URLs
    return new URL(url, window.location.origin).href;
  } catch (e) {
    console.error('Error normalizing URL:', e);
    return url;
  }
};
