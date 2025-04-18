
/**
 * Utility functions for handling invoice previews
 */

/**
 * Checks if a string is a valid URL
 * 
 * @param str String to check
 * @returns boolean indicating if the string is a valid URL
 */
export const isValidUrl = (str: string): boolean => {
  if (!str) return false;
  
  try {
    new URL(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Normalizes a URL by ensuring it has a protocol
 * 
 * @param url URL to normalize
 * @returns Normalized URL with protocol
 */
export const normalizeUrl = (url: string): string => {
  if (!url) return '';
  
  // Remove any leading/trailing whitespace
  url = url.trim();
  
  // Check if the URL already has a protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Add https:// protocol if missing
  return `https://${url}`;
};

/**
 * Checks if HTML content is valid enough to display
 * 
 * @param html HTML content to check
 * @returns boolean indicating if the HTML is valid enough to display
 */
export const isValidHtml = (html: string): boolean => {
  if (!html) return false;
  
  // Check for some basic HTML structure
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(html);
  
  // Exclude placeholder content
  const isPlaceholder = /See what happens|placeholder/i.test(html);
  
  return hasHtmlTags && !isPlaceholder && html.length > 15;
};

/**
 * Sanitizes HTML content for safe rendering
 * 
 * @param html HTML content to sanitize
 * @returns Sanitized HTML
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Very basic sanitization - in a production app, use a proper sanitizer like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/on\w+=\w+/gi, '');
};

/**
 * Gets the file extension from a URL or filename
 * 
 * @param urlOrFilename URL or filename to extract extension from
 * @returns Lowercase file extension without the dot
 */
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

/**
 * Checks if a URL or filename is a PDF
 * 
 * @param urlOrFilename URL or filename to check
 * @returns boolean indicating if it's a PDF
 */
export const isPdf = (urlOrFilename: string): boolean => {
  if (!urlOrFilename) return false;
  
  // Check extension
  const ext = getFileExtension(urlOrFilename);
  return ext === 'pdf';
};

/**
 * Checks if a URL or filename is an image
 * 
 * @param urlOrFilename URL or filename to check
 * @returns boolean indicating if it's an image
 */
export const isImage = (urlOrFilename: string): boolean => {
  if (!urlOrFilename) return false;
  
  // Check extension
  const ext = getFileExtension(urlOrFilename);
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext);
};
