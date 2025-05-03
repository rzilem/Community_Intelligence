export function extractVendorInformation(content: string, from: string): { vendor?: string } {
  const result: { vendor?: string } = {};
  
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
  
  if (from) {
    const displayNameMatch = from.match(/^([^<]+)</);
    if (displayNameMatch && displayNameMatch[1] && displayNameMatch[1].trim()) {
      const displayName = displayNameMatch[1].trim();
      const isPersonalName = /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(displayName);
      if (!isPersonalName) {
        result.vendor = displayName;
        return result;
      }
    }
    
    const emailDomain = from.match(/@([^.]+)\./);
    if (emailDomain && emailDomain[1] && 
        !['gmail', 'yahoo', 'hotmail', 'outlook', 'aol', 'icloud', 'me', 'protonmail'].includes(emailDomain[1].toLowerCase())) {
      result.vendor = emailDomain[1].charAt(0).toUpperCase() + emailDomain[1].slice(1);
      return result;
    }
  }
  
  return result;
}