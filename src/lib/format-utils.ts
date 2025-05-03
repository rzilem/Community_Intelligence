
/**
 * Formats a file size in bytes to a human-readable format
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Formats a date string to a human-readable format
 * @param dateString Date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Truncates a string to a specified length
 * @param str String to truncate
 * @param length Maximum length
 * @returns Truncated string
 */
export function truncateString(str: string, length: number): string {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

/**
 * Cleans HTML content and email formatting from text
 * @param text Text to clean
 * @returns Cleaned text without HTML markup, CSS styles, or email artifacts
 */
export function cleanHtmlContent(text: string): string {
  if (!text) return '';
  
  // Create a temporary div to handle both HTML and plain text
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = text;
  let plainText = tempDiv.textContent || tempDiv.innerText || '';
  
  // Remove CSS styles often found in emails
  plainText = plainText.replace(/(\w+)\s*{[^}]*}/g, '');
  
  // Remove [Image] tags and other email artifacts
  plainText = plainText.replace(/\[Image\]/gi, '');
  plainText = plainText.replace(/\[Attachment\]/gi, '');
  plainText = plainText.replace(/\[cid:[^\]]+\]/gi, '');
  
  // Remove email signatures indicators
  const signatureIndicators = [
    'Thank you,', 'Thanks,', 'Regards,', 'Best regards,', 
    'Sincerely,', 'Cheers,', 'Best wishes,', '--', '---'
  ];
  
  for (const indicator of signatureIndicators) {
    const index = plainText.indexOf(indicator);
    if (index !== -1) {
      plainText = plainText.substring(0, index).trim();
    }
  }
  
  // Remove contact information patterns
  plainText = plainText.replace(/\(\d{3}\)\s*\d{3}-\d{4}/g, ''); // Phone numbers like (512) 555-1234
  plainText = plainText.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, ''); // Email addresses
  plainText = plainText.replace(/http[s]?:\/\/\S+/g, ''); // URLs
  
  // Normalize whitespace
  plainText = plainText.replace(/\s+/g, ' ').trim();
  
  return plainText;
}
