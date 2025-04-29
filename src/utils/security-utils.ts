
/**
 * Validates a URL for security and format correctness.
 * 
 * @param url The URL to validate
 * @returns The URL if valid, empty string otherwise
 */
export function validateUrl(url: string): string {
  if (!url) return '';
  
  try {
    // Check if the string is a valid URL
    const urlObj = new URL(url);
    
    // Check for allowed protocols
    const allowedProtocols = ['https:', 'http:'];
    if (!allowedProtocols.includes(urlObj.protocol)) {
      console.error('URL validation failed: Invalid protocol', url);
      return '';
    }
    
    // Block potentially dangerous hostnames
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      'evil.com'
    ];
    
    if (blockedHosts.some(host => urlObj.hostname.includes(host))) {
      console.error('URL validation failed: Blocked hostname', url);
      return '';
    }
    
    // Additional checks can be added here
    
    return url;
  } catch (error) {
    console.error('URL validation failed:', error, url);
    return '';
  }
}

/**
 * Validates if a file type is allowed for upload
 * 
 * @param fileType MIME type of the file
 * @returns Boolean indicating if the file type is allowed
 */
export function isAllowedFileType(fileType: string): boolean {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];
  
  return allowedTypes.includes(fileType);
}

/**
 * Sanitizes a filename to remove potentially dangerous characters
 * 
 * @param filename The input filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';
  
  // Replace potentially dangerous characters
  let sanitized = filename.replace(/[\/\?<>\\:\*\|"]/g, '_');
  
  // Remove any path traversal attempts
  sanitized = sanitized.replace(/\.\.\//g, '');
  
  return sanitized;
}
