
export const createProxyUrl = (fullStorageUrl: string, attempt: number): string => {
  if (!fullStorageUrl) return '';
  
  console.log('Creating proxy URL for:', fullStorageUrl);

  let relativePath = '';

  try {
    // Special case for direct Supabase storage URLs
    if (fullStorageUrl.includes('supabase.co/storage/v1/object/public/invoices/')) {
      const urlObj = new URL(fullStorageUrl);
      const pathParts = urlObj.pathname.split('/');
      const invoicesIndex = pathParts.indexOf('invoices');
      
      if (invoicesIndex !== -1 && invoicesIndex < pathParts.length - 1) {
        // Get everything after 'invoices/'
        relativePath = pathParts.slice(invoicesIndex + 1).join('/');
        console.log('Extracted from Supabase URL:', relativePath);
      } else {
        relativePath = urlObj.pathname;
        console.log('Using full pathname:', relativePath);
      }
    } 
    // Handle relative paths directly 
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
    
    const proxyUrl = `https://cahergndkwfqltxyikyr.supabase.co/functions/v1/pdf-proxy?pdf=${encodeURIComponent(relativePath)}&t=${uniqueKey}`;
    console.log(`Generated proxy URL: ${proxyUrl} for relative path: ${relativePath}`);
    
    return proxyUrl;
  } catch (e) {
    console.error('Error generating proxy URL:', e);
    throw e;
  }
};
