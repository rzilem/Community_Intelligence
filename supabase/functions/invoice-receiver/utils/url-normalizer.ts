
/**
 * Normalizes URLs to prevent double slashes and other malformations
 * @param {string} url The URL to normalize
 * @returns {string} Normalized URL
 */
export function normalizeUrl(url) {
  if (!url) return url;
  
  try {
    // Handle protocol correctly
    if (url.includes('://')) {
      const [protocol, rest] = url.split('://');
      
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
    return url; // Return original URL if normalization fails
  }
}
