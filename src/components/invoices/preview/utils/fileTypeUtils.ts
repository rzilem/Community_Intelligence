/**
 * Checks if a URL or filename refers to a PDF file
 */
export const isPdf = (urlOrFilename: string): boolean => {
  if (!urlOrFilename) return false;
  const lowerUrl = urlOrFilename.toLowerCase();
  
  // Check file extension
  if (lowerUrl.endsWith('.pdf')) return true;
  
  // Check content type
  if (lowerUrl.includes('application/pdf')) return true;
  
  // Check URL parameters that might indicate PDF
  if (lowerUrl.includes('pdf=true') || lowerUrl.includes('type=pdf')) return true;
  
  // Check for PDF viewer URLs
  if (lowerUrl.includes('viewer') && lowerUrl.includes('pdf')) return true;
  
  return false;
};

/**
 * Checks if a URL or filename refers to a Word document
 */
export const isWordDocument = (urlOrFilename: string): boolean => {
  if (!urlOrFilename) return false;
  const extension = getFileExtension(urlOrFilename);
  return extension === 'doc' || extension === 'docx';
};

/**
 * Checks if a URL or filename refers to an image
 */
export const isImage = (urlOrFilename: string): boolean => {
  if (!urlOrFilename) return false;
  const lowerUrl = urlOrFilename.toLowerCase();
  return lowerUrl.endsWith('.jpg') || 
         lowerUrl.endsWith('.jpeg') || 
         lowerUrl.endsWith('.png') || 
         lowerUrl.endsWith('.gif') || 
         lowerUrl.endsWith('.bmp') || 
         lowerUrl.endsWith('.webp') ||
         lowerUrl.includes('image/');
};

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
