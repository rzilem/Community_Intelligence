
export const createProxyUrl = (fullStorageUrl: string, attempt: number): string => {
  if (!fullStorageUrl) return '';
  
  console.log('Creating proxy URL for:', fullStorageUrl);

  try {
    // Keep track of the original URL for debugging
    let proxyParams = new URLSearchParams();
    proxyParams.append('t', `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${attempt}`);
    
    // Extract UUID from URL if it exists (for invoice IDs)
    const uuidMatch = fullStorageUrl.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (uuidMatch) {
      const fileId = uuidMatch[1];
      console.log('Extracted UUID from URL:', fileId);
      proxyParams.append('id', fileId);
    }
    
    // Normalize the URL by removing duplicate slashes in paths
    const normalizeUrl = (url: string): string => {
      try {
        // For URLs with protocol, use URL parsing
        if (url.startsWith('http')) {
          const parsed = new URL(url);
          // Normalize pathname by replacing multiple slashes with a single one
          parsed.pathname = parsed.pathname.replace(/\/+/g, '/');
          return parsed.toString();
        }
        // For relative paths, just replace multiple slashes
        return url.replace(/\/+/g, '/');
      } catch (e) {
        console.error('Error normalizing URL:', e);
        return url; // Return original if parsing fails
      }
    };
    
    // For Supabase URLs, send the entire URL to the proxy after normalizing
    if (fullStorageUrl.includes('supabase.co/storage/v1/object/public/')) {
      console.log('Processing Supabase storage URL');
      
      // Normalize the URL before sending to proxy
      const normalizedUrl = normalizeUrl(fullStorageUrl);
      console.log('Normalized Supabase URL:', normalizedUrl);
      
      // Send the complete normalized URL to the proxy
      proxyParams.append('pdf', encodeURIComponent(normalizedUrl));
      
      const supabaseUrl = 'https://cahergndkwfqltxyikyr.supabase.co';
      const proxyUrl = `${supabaseUrl}/functions/v1/pdf-proxy?${proxyParams.toString()}`;
      console.log('Generated proxy URL with full path:', proxyUrl);
      return proxyUrl;
    }
    
    // For relative paths or other URLs
    let relativePath = fullStorageUrl;
    
    // If it's a relative path (no protocol prefix)
    if (!fullStorageUrl.startsWith('http')) {
      console.log('Processing relative path:', relativePath);
      // Normalize the relative path
      relativePath = normalizeUrl(relativePath);
      console.log('Normalized relative path:', relativePath);
    } 
    // For any other URL format
    else {
      console.log('Processing other URL format');
      // Try to extract the filename
      const urlParts = fullStorageUrl.split('/');
      relativePath = urlParts[urlParts.length - 1];
      console.log('Extracted filename:', relativePath);
    }
    
    // Add the path to the parameters
    proxyParams.append('pdf', encodeURIComponent(relativePath));
    
    // Create and return the proxy URL
    const supabaseUrl = 'https://cahergndkwfqltxyikyr.supabase.co';
    const proxyUrl = `${supabaseUrl}/functions/v1/pdf-proxy?${proxyParams.toString()}`;
    
    console.log('Generated proxy URL:', proxyUrl);
    return proxyUrl;
  } catch (e) {
    console.error('Error generating proxy URL:', e);
    return ''; // Return empty string instead of throwing to prevent crashing
  }
};
