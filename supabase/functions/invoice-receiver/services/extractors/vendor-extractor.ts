
export function extractVendorInformation(content: string, from: string): { vendor?: string } {
  const result: { vendor?: string } = {};
  
  // Try to extract from content first with more robust patterns
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
    /issued\s+by[:\s]+([^,\n\r<>]+)/i,
    /letterhead:\s+([^,\n\r<>]+)/i,
    /company\s+logo:\s+([^,\n\r<>]+)/i
  ];
  
  for (const pattern of vendorPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.vendor = match[1].trim();
      console.log(`Extracted vendor from content: ${result.vendor}`);
      return result;
    }
  }
  
  // If not found in content, try to extract from email's from field
  if (from) {
    // Try to get display name from From field first
    const displayNameMatch = from.match(/^([^<]+)</);
    if (displayNameMatch && displayNameMatch[1] && displayNameMatch[1].trim()) {
      const displayName = displayNameMatch[1].trim();
      
      // Check if it's not a personal name (simple heuristic)
      // This avoids setting vendors like "John Smith" which are likely individuals
      const isPersonalName = /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(displayName);
      if (!isPersonalName) {
        result.vendor = displayName;
        console.log(`Extracted vendor from email display name: ${result.vendor}`);
        return result;
      }
    }
    
    // If no display name or it's a personal name, try to use the domain part as vendor
    const emailDomain = from.match(/@([^.]+)\./);
    if (emailDomain && emailDomain[1] && 
        !['gmail', 'yahoo', 'hotmail', 'outlook', 'aol', 'icloud', 'me', 'protonmail'].includes(emailDomain[1].toLowerCase())) {
      // Use the domain name as vendor, capitalize first letter
      result.vendor = emailDomain[1].charAt(0).toUpperCase() + emailDomain[1].slice(1);
      console.log(`Using email domain as vendor: ${result.vendor}`);
      return result;
    }
  }
  
  // If we still haven't found a vendor, check for header/footer text in the content
  const headerFooterPatterns = [
    /^\s*([A-Z][A-Za-z0-9\s&,.']+(?:Inc|LLC|Ltd|Co|Corporation|Company)\.?)/m,
    /([A-Z][A-Za-z0-9\s&,.']+(?:Inc|LLC|Ltd|Co|Corporation|Company)\.?)\s*$/m
  ];
  
  for (const pattern of headerFooterPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.vendor = match[1].trim();
      console.log(`Extracted vendor from header/footer: ${result.vendor}`);
      return result;
    }
  }
  
  console.log("No vendor information found");
  return result;
}
