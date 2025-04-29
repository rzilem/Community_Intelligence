
/**
 * Normalizes URLs to prevent double slashes and other malformations
 * @param {string} url The URL to normalize
 * @returns {string} Normalized URL
 */
export function normalizeUrl(url) {
  if (!url) return url;
  
  try {
    // Validate input is a string
    if (typeof url !== 'string') {
      console.warn("Invalid URL type provided to normalizer:", typeof url);
      return '';
    }
    
    // Prevent XSS by removing javascript: protocol
    if (url.toLowerCase().trim().startsWith('javascript:')) {
      console.warn("Blocked potential XSS attempt with javascript: protocol in URL");
      return '';
    }
    
    // Handle protocol correctly
    if (url.includes('://')) {
      const [protocol, rest] = url.split('://');
      
      // Validate protocol is a safe one
      const safeProtocols = ['http', 'https', 'ftp', 'ftps'];
      if (!safeProtocols.includes(protocol.toLowerCase())) {
        console.warn(`Blocked potentially unsafe protocol: ${protocol}`);
        return '';
      }
      
      // Only normalize the path portion, not the query parameters
      if (rest.includes('?')) {
        const [path, query] = rest.split('?');
        // Replace multiple consecutive slashes with a single slash
        const normalizedPath = path.replace(/\/+/g, '/');
        return `${protocol}://${normalizedPath}?${query}`;
      } else {
        // Replace multiple consecutive slashes with a single slash
        const normalizedPath = rest.replace(/\/+/g, '/');
        return `${protocol}://${normalizedPath}`;
      }
    } else {
      // No protocol, just normalize slashes
      return url.replace(/\/+/g, '/');
    }
  } catch (error) {
    console.error("Error normalizing URL:", error);
    return ''; // Return empty string on error to prevent security issues
  }
}
