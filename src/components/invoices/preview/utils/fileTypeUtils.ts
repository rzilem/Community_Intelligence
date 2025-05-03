
/**
 * Checks if the provided URL or file name is a PDF
 * @param url The URL or filename to check
 * @returns Whether the URL or filename is a PDF
 */
export const isPdf = (url: string): boolean => {
  if (!url) return false;
  return url.toLowerCase().endsWith('.pdf') || 
         url.toLowerCase().includes('/pdf') || 
         url.toLowerCase().includes('application/pdf');
};

/**
 * Checks if the provided URL or file name is an image
 * @param url The URL or filename to check
 * @returns Whether the URL or filename is an image
 */
export const isImage = (url: string): boolean => {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

/**
 * Gets the file extension from a URL or file path
 * @param url The URL or file path
 * @returns The file extension (without the dot)
 */
export const getFileExtension = (url: string): string => {
  if (!url) return '';
  const parts = url.split('.');
  if (parts.length <= 1) return '';
  
  // Get the part after the last dot
  let extension = parts[parts.length - 1];
  
  // Remove query parameters or hash fragments
  extension = extension.split('?')[0].split('#')[0];
  
  return extension.toLowerCase();
};

/**
 * Checks if the provided URL or file name is a Word document
 * @param url The URL or filename to check
 * @returns Whether the URL or filename is a Word document
 */
export const isWordDocument = (url: string): boolean => {
  if (!url) return false;
  const extension = getFileExtension(url);
  return extension === 'doc' || extension === 'docx';
};

/**
 * Checks if the provided URL or file name is an Excel document
 * @param url The URL or filename to check
 * @returns Whether the URL or filename is an Excel document
 */
export const isExcelDocument = (url: string): boolean => {
  if (!url) return false;
  const extension = getFileExtension(url);
  return extension === 'xls' || extension === 'xlsx';
};
