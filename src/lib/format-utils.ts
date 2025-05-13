
/**
 * Format a file size in bytes to a human-readable string
 * @param bytes File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format a currency value
 * @param value Amount to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value?: number | null, 
  currency: string = 'USD'
): string => {
  if (value === undefined || value === null) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Clean HTML content by removing potentially harmful tags and scripts
 * @param htmlContent The HTML content to clean
 * @returns Cleaned HTML content
 */
export const cleanHtmlContent = (htmlContent: string): string => {
  if (!htmlContent) return '';
  
  // Create a temporary div element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Remove script tags
  const scriptTags = tempDiv.querySelectorAll('script');
  scriptTags.forEach(script => script.remove());
  
  // Remove style tags
  const styleTags = tempDiv.querySelectorAll('style');
  styleTags.forEach(style => style.remove());
  
  // Remove iframe tags
  const iframeTags = tempDiv.querySelectorAll('iframe');
  iframeTags.forEach(iframe => iframe.remove());
  
  // Remove on* attributes from all elements
  const allElements = tempDiv.querySelectorAll('*');
  allElements.forEach(element => {
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        element.removeAttribute(attr.name);
      }
    });
  });
  
  return tempDiv.innerHTML;
};
