
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
      } else {
        // Fallback to the whole path if we can't parse it
        relativePath = urlObj.pathname;
      }
    } 
    // Handle relative paths directly 
    else if (!fullStorageUrl.startsWith('http')) {
      relativePath = fullStorageUrl;
    }
    // Standard URL parsing for other cases - just get the filename
    else {
      relativePath = fullStorageUrl.split('/').pop() || '';
    }
  } catch (e) {
    console.error('Failed to parse URL:', fullStorageUrl, e);
    relativePath = fullStorageUrl.split('/').pop() || '';
  }

  if (!relativePath) {
    console.error('Could not determine relative path for:', fullStorageUrl);
    return '';
  }

  // Add unique identifiers to prevent caching issues
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 10);
  const uniqueKey = `${timestamp}-${randomId}-${attempt}`;
  
  const proxyUrl = `https://cahergndkwfqltxyikyr.supabase.co/functions/v1/pdf-proxy?pdf=${encodeURIComponent(relativePath)}&t=${uniqueKey}`;
  console.log(`Generated proxy URL: ${proxyUrl} for relative path: ${relativePath}`);
  
  return proxyUrl;
};

export const createPdfViewerUrls = (proxyUrl: string) => ({
  pdfJs: `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(proxyUrl)}`,
  googleDocs: `https://docs.google.com/viewer?url=${encodeURIComponent(proxyUrl)}&embedded=true`
});
