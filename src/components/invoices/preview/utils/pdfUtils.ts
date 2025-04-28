
// Function to create a proxy URL with proper URL normalization
export const createProxyUrl = (fullStorageUrl: string, attempt: number): string => {
  if (!fullStorageUrl) return '';
  
  console.log('Creating proxy URL for:', fullStorageUrl);

  try {
    // Parameters for the proxy
    let proxyParams = new URLSearchParams();
    proxyParams.append('t', `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${attempt}`);
    
    // Extract UUID from URL if it exists (for invoice IDs)
    const uuidMatch = fullStorageUrl.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (uuidMatch) {
      const fileId = uuidMatch[1];
      proxyParams.append('id', fileId);
    }
    
    // Improved URL normalization function
    const normalizeUrlPath = (url: string): string => {
      try {
        if (!url) return '';
        
        // For URLs with protocol, use URL parsing for robust handling
        if (url.includes('://')) {
          const parsed = new URL(url);
          
          // Clean pathname - filter out empty segments
          const pathSegments = parsed.pathname.split('/')
            .filter(segment => segment !== '');
          
          parsed.pathname = '/' + pathSegments.join('/');
          return parsed.toString();
        }
        
        // For relative paths, clean up slashes
        let normalized = url.replace(/^\/+/, '');
        normalized = normalized.replace(/\/+/g, '/');
        return normalized;
      } catch (e) {
        console.error('Error normalizing URL in pdfUtils:', e);
        return url;
      }
    };
    
    // Normalize the URL before processing
    const normalizedUrl = normalizeUrlPath(fullStorageUrl);
    
    // For Supabase URLs
    if (normalizedUrl.includes('supabase.co/storage/v1/object/public/')) {
      // Send the complete normalized URL to the proxy
      proxyParams.append('pdf', encodeURIComponent(normalizedUrl));
      
      const supabaseUrl = 'https://cahergndkwfqltxyikyr.supabase.co';
      const proxyUrl = `${supabaseUrl}/functions/v1/pdf-proxy?${proxyParams.toString()}`;
      return proxyUrl;
    }
    
    // For relative paths or other URLs
    let relativePath = normalizedUrl;
    
    if (!normalizedUrl.startsWith('http')) {
      relativePath = normalizeUrlPath(relativePath);
    } else {
      // Extract the filename from full URLs
      const urlParts = normalizedUrl.split('/');
      relativePath = urlParts[urlParts.length - 1];
    }
    
    // Add the path to the parameters
    proxyParams.append('pdf', encodeURIComponent(relativePath));
    
    // Create and return the proxy URL
    const supabaseUrl = 'https://cahergndkwfqltxyikyr.supabase.co';
    const proxyUrl = `${supabaseUrl}/functions/v1/pdf-proxy?${proxyParams.toString()}`;
    
    return proxyUrl;
  } catch (e) {
    console.error('Error generating proxy URL:', e);
    return '';
  }
};
