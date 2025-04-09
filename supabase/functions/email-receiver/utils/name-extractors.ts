
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
        !['gmail', 'yahoo', 'hotmail', 'outlook', 'aol', 'example'].includes(domainMatch[1].toLowerCase())) {
      // Don't return generic domains as names
      return ""; 
    }
  }
  
  // If we really can't find a name, return empty string
  return "";
}
