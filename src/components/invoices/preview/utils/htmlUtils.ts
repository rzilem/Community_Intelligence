
import DOMPurify from 'dompurify';

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
