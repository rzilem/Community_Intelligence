
/**
 * Helper functions for extracting vendor information from email content
 */

export function extractVendorInformation(content: string, from: string): { vendor?: string } {
  const result: { vendor?: string } = {};
  
  // Look for vendor name in common formats
  const vendorPatterns = [
    /vendor(?:\s*name)?[:\s]+([^,\n\r<>]+)/i,
    /from[:\s]+([^,\n\r<>]+)/i,
    /bill(?:\s*from)?[:\s]+([^,\n\r<>]+)/i,
    /invoice\s+from[:\s]+([^,\n\r<>]+)/i,
    /company[:\s]+([^,\n\r<>]+)/i,
    /billed\s+by[:\s]+([^,\n\r<>]+)/i,
    /supplier[:\s]+([^,\n\r<>]+)/i
  ];
  
  for (const pattern of vendorPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.vendor = match[1].trim();
      return result;
    }
  }
  
  // Try to extract from email domain if we couldn't find it in content
  if (from) {
    const emailDomain = from.match(/@([^.]+)\./);
    if (emailDomain && emailDomain[1] && 
        !['gmail', 'yahoo', 'hotmail', 'outlook', 'aol'].includes(emailDomain[1].toLowerCase())) {
      // Format it nicely
      result.vendor = emailDomain[1].charAt(0).toUpperCase() + emailDomain[1].slice(1);
      return result;
    }
  }
  
  return result;
}
