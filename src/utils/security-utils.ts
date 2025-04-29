
import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string | undefined): string {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    FORBID_TAGS: ['script', 'iframe', 'form', 'object', 'embed', 'link'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'eval', 'javascript:']
  });
}

/**
 * Validates that a URL belongs to trusted domains
 */
export function validateUrl(url: string | undefined): string {
  if (!url) return '';
  
  try {
    const parsedUrl = new URL(url);
    
    // List of domains considered trusted
    const trustedDomains = [
      'cahergndkwfqltxyikyr.supabase.co',
      'lovable.app',
      'hoa-ai-community-nexus.lovable.app'
    ];
    
    if (!trustedDomains.some(domain => parsedUrl.hostname.includes(domain))) {
      console.warn('URL from untrusted domain:', parsedUrl.hostname);
      return '';
    }
    
    return url;
  } catch (e) {
    console.error('Invalid URL:', e);
    return '';
  }
}

/**
 * Validates UUID format
 */
export function isValidUuid(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Creates a sanitized object safe for logging
 * Removes sensitive fields and truncates large values
 */
export function createSafeLogObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  // List of sensitive field names to redact
  const sensitiveFields = ['password', 'token', 'key', 'secret', 'auth', 'jwt', 'credit_card'];
  
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      // Check if this is a sensitive field
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        return [key, '[REDACTED]'];
      }
      
      // Handle nested objects
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return [key, createSafeLogObject(value)];
      }
      
      // Truncate very long string values
      if (typeof value === 'string' && value.length > 200) {
        return [key, `${value.substring(0, 200)}... [truncated]`];
      }
      
      return [key, value];
    })
  );
}

/**
 * Safe console logging function that redacts sensitive data
 */
export function safeLog(message: string, data?: any): void {
  if (data) {
    console.log(message, createSafeLogObject(data));
  } else {
    console.log(message);
  }
}
