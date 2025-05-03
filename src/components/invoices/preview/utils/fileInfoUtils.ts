/**
 * Extracts the file extension from a URL or filename
 */
export const getFileExtension = (urlOrFilename: string): string => {
  if (!urlOrFilename) return '';
  
  try {
    // Extract the filename from the URL if it's a URL
    let filename = urlOrFilename;
    
    // Parse URL if it looks like a URL
    if (urlOrFilename.includes('://') || urlOrFilename.startsWith('/')) {
      try {
        const url = new URL(urlOrFilename, window.location.origin);
        
        // First check if there's a download filename in the Content-Disposition
        const contentDisposition = url.searchParams.get('filename');
        if (contentDisposition) {
          filename = contentDisposition;
        } else {
          // Otherwise use the pathname
          const pathSegments = url.pathname.split('/');
          filename = pathSegments.pop() || '';
          
          // Remove any query parameters
          filename = filename.split('?')[0];
        }
      } catch (e) {
        // Not a valid URL, use as filename
        console.log("Not a valid URL, using as filename:", urlOrFilename);
      }
    }
    
    // Check for extensions in query strings
    if (filename.includes('?')) {
      const queryParams = new URLSearchParams(filename.split('?')[1]);
      const formatParam = queryParams.get('format') || queryParams.get('type');
      if (formatParam) {
        return formatParam.toLowerCase();
      }
    }
    
    // Extract extension from filename
    const parts = filename.split('.');
    if (parts.length > 1) {
      return parts.pop()?.toLowerCase() || '';
    }
    
    return '';
  } catch (e) {
    console.error("Error getting file extension:", e);
    return '';
  }
};
