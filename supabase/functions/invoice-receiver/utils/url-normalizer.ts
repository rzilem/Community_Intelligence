
/**
 * Normalizes a URL by:
 * - Ensuring proper protocol (https:// or http://)
 * - Removing duplicate slashes in the path
 * - Preserving query parameters
 * 
 * @param url The URL to normalize
 * @returns The normalized URL
 */
export function normalizeUrl(url: string): string {
  if (!url) return '';

  try {
    // Handle URLs that don't have a protocol
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }
    
    // Parse the URL
    const parsed = new URL(url);
    
    // Get the protocol and host
    const protocol = parsed.protocol;
    const host = parsed.host;
    
    // Split path and query/hash
    let path = parsed.pathname;
    const search = parsed.search;
    const hash = parsed.hash;
    
    // Remove duplicate slashes in the path (but preserve initial double slash after protocol)
    path = path.replace(/\/+/g, '/');
    
    // Reconstruct the URL
    return `${protocol}//${host}${path}${search}${hash}`;
  } catch (error) {
    console.error('Error normalizing URL:', error);
    
    // If URL parsing fails, do basic cleanup
    // Add https:// if missing
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }
    
    // Remove duplicate slashes in the path portion, preserving protocol slashes
    let parts = url.split('://');
    if (parts.length > 1) {
      const protocol = parts[0];
      const rest = parts.slice(1).join('://'); 
      
      // Find where the path starts (after the first slash following the domain)
      const firstSlashPos = rest.indexOf('/');
      if (firstSlashPos > -1) {
        const domain = rest.substring(0, firstSlashPos);
        let path = rest.substring(firstSlashPos);
        
        // Remove duplicate slashes only in the path portion
        path = path.replace(/\/+/g, '/');
        
        return `${protocol}://${domain}${path}`;
      }
      
      // No path in URL, just return as is
      return url;
    }
    
    // If all else fails, return the original URL
    return url;
  }
}
