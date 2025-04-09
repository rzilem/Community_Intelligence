
/**
 * Helper functions for extracting name information from headers and content
 */

// Helper function to extract name from header format like "Name <email@domain.com>"
export function extractNameFromHeader(header: string): string {
  if (!header) return "";
  
  // Clean the header
  let cleanedHeader = header.trim();
  
  // Enhanced pattern to handle "From:" prefix that might be part of the header
  if (cleanedHeader.toLowerCase().startsWith("from:")) {
    cleanedHeader = cleanedHeader.substring(5).trim();
  }
  
  // Handle Mark Stein <markstein@example.com> format
  const nameMatch = cleanedHeader.match(/^([^<]+)</);
  if (nameMatch && nameMatch[1]) {
    const name = nameMatch[1].trim();
    if (name && !name.includes("@")) {
      // Don't return the name if it looks like it's just the email username
      const emailMatch = cleanedHeader.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch && name.toLowerCase() === emailMatch[0].split('@')[0].toLowerCase()) {
        return "";
      }
      return name;
    }
  }
  
  // Handle email@example.com (Mark Stein) format
  const parenthesesMatch = cleanedHeader.match(/\(([^)]+)\)/);
  if (parenthesesMatch && parenthesesMatch[1]) {
    return parenthesesMatch[1].trim();
  }
  
  // Handle just Mark Stein format (no email)
  if (!cleanedHeader.includes('@') && !cleanedHeader.includes('<') && !cleanedHeader.includes('>')) {
    return cleanedHeader.trim();
  }
  
  // If we have a raw email address with no name
  if (cleanedHeader.includes('@')) {
    // See if we can extract a domain name that might be useful
    const domainMatch = cleanedHeader.match(/@([^.]+)\./);
    if (domainMatch && domainMatch[1] && 
        !['gmail', 'yahoo', 'hotmail', 'outlook', 'aol', 'example', 'icloud'].includes(domainMatch[1].toLowerCase())) {
      // Don't return generic domains as names
      return ""; 
    }
  }
  
  // If we really can't find a name, return empty string
  return "";
}
