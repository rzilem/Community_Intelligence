
/**
 * Helper functions for extracting vendor information from email content
 */

export function extractVendorInformation(content: string, from: string): { vendor?: string } {
  const result: { vendor?: string } = {};
  
  // Look for vendor name in common formats - extended patterns
  const vendorPatterns = [
    /vendor(?:\s*name)?[:\s]+([^,\n\r<>]+)/i,
    /from[:\s]+([^,\n\r<>]+)/i,
    /bill(?:\s*from)?[:\s]+([^,\n\r<>]+)/i,
    /invoice\s+from[:\s]+([^,\n\r<>]+)/i,
    /company[:\s]+([^,\n\r<>]+)/i,
    /billed\s+by[:\s]+([^,\n\r<>]+)/i,
    /supplier[:\s]+([^,\n\r<>]+)/i,
    /payable\s+to[:\s]+([^,\n\r<>]+)/i,
    /business\s+name[:\s]+([^,\n\r<>]+)/i,
    /issued\s+by[:\s]+([^,\n\r<>]+)/i
  ];
  
  for (const pattern of vendorPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.vendor = match[1].trim();
      return result;
    }
  }
  
  // Try to extract from sender's display name (typically appears before email address)
  if (from) {
    // Look for display name pattern: "Display Name <email@example.com>"
    const displayNameMatch = from.match(/^([^<]+)</);
    if (displayNameMatch && displayNameMatch[1] && displayNameMatch[1].trim()) {
      const displayName = displayNameMatch[1].trim();
      // Don't use if it looks like a personal name (contains space and each part starts with capital)
      const isPersonalName = /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(displayName);
      if (!isPersonalName) {
        result.vendor = displayName;
        return result;
      }
    }
    
    // Try to extract from email domain if previous attempts failed
    const emailDomain = from.match(/@([^.]+)\./);
    if (emailDomain && emailDomain[1] && 
        !['gmail', 'yahoo', 'hotmail', 'outlook', 'aol', 'icloud', 'me', 'protonmail'].includes(emailDomain[1].toLowerCase())) {
      // Format it nicely
      result.vendor = emailDomain[1].charAt(0).toUpperCase() + emailDomain[1].slice(1);
      return result;
    }
  }
  
  return result;
}
