
/**
 * Checks if a string is a valid URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    // Handle relative URLs as valid
    if (url.startsWith('/')) return true;
    
    // Test with URL constructor for absolute URLs
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Normalizes a URL by ensuring it has a protocol
 */
export const normalizeUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    // Handle relative URLs
    if (url.startsWith('/')) {
      // For relative URLs, convert to absolute using the current domain
      return `${window.location.origin}${url}`;
    }
    
    // Check if the URL already has a protocol
    if (url.match(/^https?:\/\//)) {
      return url;
    }
    
    // Try to parse the URL to see if it's valid
    try {
      new URL(`https://${url}`);
      return `https://${url}`;
    } catch {
      // If https fails, try with http
      try {
        new URL(`http://${url}`);
        return `http://${url}`;
      } catch {
        // If both fail, return the original URL
        console.warn('Could not normalize URL:', url);
        return url;
      }
    }
  } catch (e) {
    console.error('Error normalizing URL:', e);
    return url;
  }
};

/**
 * Checks if a URL is accessible
 */
export const checkUrlAccessibility = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { 
      method: 'HEAD', 
      cache: 'no-store',
      headers: { 'Accept': 'application/pdf' }
    });
    return response.ok;
  } catch (e) {
    return false;
  }
};
