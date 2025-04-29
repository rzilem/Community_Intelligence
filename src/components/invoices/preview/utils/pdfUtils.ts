
import { normalizeUrl } from '../previewUtils';

/**
 * Creates a proxy URL for PDF files with proper URL normalization.
 * The proxy helps handle CORS and access issues for PDF viewing.
 * 
 * @param fullStorageUrl The original storage URL to proxy
 * @param attempt Retry attempt number for cache busting
 * @returns The proxy URL
 */
export const createProxyUrl = (fullStorageUrl: string, attempt: number): string => {
  if (!fullStorageUrl) return '';
  
  // Parameters for the proxy
  let proxyParams = new URLSearchParams();
  proxyParams.append('t', `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${attempt}`);
  
  // Extract UUID from URL if it exists (for invoice IDs)
  const uuidMatch = fullStorageUrl.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  if (uuidMatch) {
    const fileId = uuidMatch[1];
    proxyParams.append('id', fileId);
  }
  
  // Normalize the URL before processing to fix double slashes
  const normalizedUrl = normalizeUrl(fullStorageUrl);
  console.log(`Original URL: ${fullStorageUrl}`);
  console.log(`Normalized URL: ${normalizedUrl}`);
  
  // For Supabase URLs
  if (normalizedUrl.includes('supabase.co/storage/v1/object/')) {
    // Extract the filename and bucket from the URL
    let bucketName = 'invoices';
    let filePath = '';
    
    if (normalizedUrl.includes('/public/')) {
      // Extract from public URL
      const parts = normalizedUrl.split('/public/');
      if (parts.length >= 2) {
        const pathParts = parts[1].split('/');
        bucketName = pathParts[0];
        filePath = pathParts.slice(1).join('/');
      }
    } else if (normalizedUrl.includes('/sign/')) {
      // Extract from signed URL
      const parts = normalizedUrl.split('/sign/');
      if (parts.length >= 2) {
        const pathWithQuery = parts[1];
        const pathParts = pathWithQuery.split('?')[0].split('/');
        bucketName = pathParts[0];
        filePath = pathParts.slice(1).join('/');
      }
    }
    
    console.log(`Extracted bucket: ${bucketName}, path: ${filePath}`);
    
    // Send the complete normalized URL and extracted path to the proxy
    proxyParams.append('pdf', encodeURIComponent(normalizedUrl));
    proxyParams.append('path', encodeURIComponent(filePath));
    proxyParams.append('bucket', bucketName);
    
    const supabaseUrl = 'https://cahergndkwfqltxyikyr.supabase.co';
    const proxyUrl = `${supabaseUrl}/functions/v1/pdf-proxy?${proxyParams.toString()}`;
    return proxyUrl;
  }
  
  // For relative paths or other URLs
  let relativePath = normalizedUrl;
  
  if (!normalizedUrl.startsWith('http')) {
    relativePath = normalizeUrl(relativePath);
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
};
