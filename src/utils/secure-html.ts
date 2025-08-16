import DOMPurify from 'dompurify';

// Enhanced DOMPurify configuration for HOA content
const createDOMPurifyConfig = () => ({
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span',
    'pre', 'code', 'hr', 'small', 'sub', 'sup'
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'alt', 'src', 'width', 'height', 'style', 'class', 'id',
    'target', 'rel', 'colspan', 'rowspan'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'button', 'select', 'textarea'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false,
  SANITIZE_DOM: true,
  SANITIZE_NAMED_PROPS: true,
  KEEP_CONTENT: false,
  ADD_TAGS: [],
  ADD_DATA_URI_TAGS: ['img'],
  ALLOW_DATA_ATTR: false
});

/**
 * Sanitizes HTML content for safe rendering in the application.
 * Used for user-generated content like announcements, messages, etc.
 */
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    const config = createDOMPurifyConfig();
    const sanitized = DOMPurify.sanitize(html, config);
    
    // Additional URL validation for links
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitized;
    
    // Validate and secure all links
    const links = tempDiv.querySelectorAll('a[href]');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (href) {
        // Only allow safe protocols
        if (!/^(https?:|mailto:|tel:)/i.test(href)) {
          link.removeAttribute('href');
        } else {
          // Add security attributes to external links
          if (href.startsWith('http')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
          }
        }
      }
    });

    // Validate and limit image sources
    const images = tempDiv.querySelectorAll('img[src]');
    images.forEach((img) => {
      const src = img.getAttribute('src');
      if (src) {
        // Only allow safe image sources
        if (!/^(https?:|data:image\/)/i.test(src)) {
          img.removeAttribute('src');
          img.setAttribute('alt', 'Invalid image source removed for security');
        }
      }
    });

    return tempDiv.innerHTML;
  } catch (error) {
    console.warn('HTML sanitization failed:', error);
    return ''; // Return empty string if sanitization fails
  }
};

/**
 * Sanitizes text content for safe display.
 * Removes HTML tags and potential XSS vectors.
 */
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove all HTML tags and decode entities
  const withoutTags = text.replace(/<[^>]*>/g, '');
  const decoded = decodeHtmlEntities(withoutTags);
  
  // Remove potential script injections
  return decoded.replace(/javascript:/gi, '')
              .replace(/vbscript:/gi, '')
              .replace(/data:/gi, '')
              .replace(/on\w+\s*=/gi, '');
};

/**
 * Decodes HTML entities safely
 */
const decodeHtmlEntities = (text: string): string => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

/**
 * Sanitizes user input for search queries and form data
 */
export const sanitizeUserInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>'"&]/g, '') // Remove dangerous characters
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .slice(0, 1000); // Limit length
};

/**
 * Validates and sanitizes URLs
 */
export const sanitizeUrl = (url: string): string | null => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const parsedUrl = new URL(url.trim());
    
    // Only allow safe protocols
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsedUrl.protocol)) {
      return null;
    }

    // Block potential XSS in URL
    if (parsedUrl.href.includes('javascript:') || 
        parsedUrl.href.includes('data:') ||
        parsedUrl.href.includes('vbscript:')) {
      return null;
    }

    return parsedUrl.href;
  } catch {
    return null;
  }
};

/**
 * Creates a safe HTML string with sanitization
 * Use this for rendering user content in React components
 */
export const createSafeHtml = (html: string) => ({
  __html: sanitizeHtml(html)
});

/**
 * Validates file names for uploads
 */
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName || typeof fileName !== 'string') {
    return 'unnamed_file';
  }

  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe characters
    .replace(/\.{2,}/g, '.') // Remove multiple dots
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .slice(0, 255); // Limit length
};