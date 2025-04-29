
/**
 * Normalizes URLs by removing redundant slashes and ensuring proper formatting.
 * 
 * @param url The URL to normalize
 * @returns The normalized URL
 */
export function normalizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    // For URLs with protocol, use URL parsing for thorough normalization
    if (url.startsWith('http')) {
      const parsed = new URL(url);
      
      // Clean the pathname by filtering empty segments
      const pathSegments = parsed.pathname.split('/')
        .filter(segment => segment !== '');
      
      // Reconstruct pathname with a single leading slash
      parsed.pathname = '/' + pathSegments.join('/');
      
      return parsed.toString();
    }
    
    // For relative paths, handle carefully
    // First remove leading slashes
    let normalized = url.replace(/^\/+/, '');
    // Then replace multiple consecutive slashes with a single one
    normalized = normalized.replace(/\/+/g, '/');
    
    return normalized;
  } catch (e) {
    console.error('Error normalizing URL:', e);
    // For any parsing errors, do basic normalization
    return url.replace(/([^:])\/+/g, '$1/');
  }
}

/**
 * Validates if a path exists within a Supabase storage bucket
 * 
 * @param supabase Supabase client
 * @param bucketName Name of the storage bucket
 * @param path Path within the bucket to check
 * @returns Boolean indicating if the file exists
 */
export async function validateStoragePath(supabase: any, bucketName: string, path: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(path);
    
    if (error) {
      console.error("Error validating storage path:", error);
      return false;
    }
    
    const response = await fetch(data.publicUrl, { method: 'HEAD' });
    return response.ok;
  } catch (e) {
    console.error("Exception validating storage path:", e);
    return false;
  }
}
