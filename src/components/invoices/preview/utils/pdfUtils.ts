
export const createProxyUrl = (fullStorageUrl: string, attempt: number): string => {
  if (!fullStorageUrl) return '';
  
  console.log('Creating proxy URL for:', fullStorageUrl);

  let relativePath = '';
  let fileId = '';

  try {
    // Extract UUID from URL if it exists (for invoice IDs)
    const uuidMatch = fullStorageUrl.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (uuidMatch) {
      fileId = uuidMatch[1];
      console.log('Extracted UUID from URL:', fileId);
    }

    // Handle different URL formats
    if (fullStorageUrl.includes('supabase.co/storage/v1/object/public/')) {
      // Direct Supabase storage URL
      const urlObj = new URL(fullStorageUrl);
      // Find the bucket name in the path segments
      const pathParts = urlObj.pathname.split('/');
      const publicIndex = pathParts.indexOf('public');
      
      if (publicIndex !== -1 && publicIndex < pathParts.length - 1) {
        // Get bucket name (first segment after 'public')
        const bucketName = pathParts[publicIndex + 1];
        
        // Get everything after the bucket name
        if (publicIndex + 2 < pathParts.length) {
          relativePath = pathParts.slice(publicIndex + 2).join('/');
          console.log(`Extracted from Supabase URL: bucket=${bucketName}, path=${relativePath}`);
        }
      } else {
        relativePath = urlObj.pathname.split('/').pop() || '';
        console.log('Using filename from pathname:', relativePath);
      }
    } 
    // Handle relative paths directly - this is a common case
    else if (!fullStorageUrl.startsWith('http')) {
      relativePath = fullStorageUrl;
      console.log('Using relative path directly:', relativePath);
    }
    // Standard URL parsing for other cases
    else {
      relativePath = fullStorageUrl.split('/').pop() || '';
      console.log('Extracted filename from URL:', relativePath);
    }

    // Add cache-busting parameters
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const uniqueKey = `${timestamp}-${randomId}-${attempt}`;
    
    // Create the proxy URL with direct access to the storage bucket
    const supabaseUrl = 'https://cahergndkwfqltxyikyr.supabase.co';
    let proxyUrl = `${supabaseUrl}/functions/v1/pdf-proxy?pdf=${encodeURIComponent(relativePath)}&t=${uniqueKey}`;
    
    // Add file ID if available
    if (fileId) {
      proxyUrl += `&id=${fileId}`;
    }
    
    console.log(`Generated proxy URL: ${proxyUrl}`);
    
    return proxyUrl;
  } catch (e) {
    console.error('Error generating proxy URL:', e);
    return ''; // Return empty string instead of throwing to prevent crashing
  }
};
