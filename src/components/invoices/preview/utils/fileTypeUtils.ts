
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
