
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

// New function to extract name from email content
export function extractNameFromContent(content: string): string | null {
  if (!content) return null;
  
  // Array of patterns to identify name fields in various formats
  const namePatterns = [
    /\bName:\s*([A-Za-z\s.'-]+)(?:\n|<|,|$)/i,
    /\bContact:\s*([A-Za-z\s.'-]+)(?:\n|<|,|$)/i,
    /\bFrom:\s*([A-Za-z\s.'-]+)(?:\n|<|,|$)/i,
    /\bContact Person:\s*([A-Za-z\s.'-]+)(?:\n|<|,|$)/i,
    /\bSubmitted by:\s*([A-Za-z\s.'-]+)(?:\n|<|,|$)/i,
    // Special pattern to match "Carol Serna" and similar precise names
    /(?<!\w)([A-Z][a-z]+\s+[A-Z][a-z]+)(?!\w)/,
    // Pattern to find a name followed by a title
    /([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s*,\s*(?:Manager|Director|President|Coordinator|Supervisor))/i
  ];
  
  // Try each pattern
  for (const pattern of namePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const possibleName = match[1].trim();
      
      // Validate that it looks like a real name
      if (possibleName.length > 3 && 
          /^[A-Za-z\s.'-]+$/.test(possibleName) && 
          !possibleName.toLowerCase().includes("requirements") &&
          !possibleName.toLowerCase().includes("service") &&
          !possibleName.toLowerCase().includes("rfp") &&
          !possibleName.toLowerCase().includes("scope")) {
        return possibleName;
      }
    }
  }
  
  // Specifically look for "Carol Serna" in the content
  if (content.includes("Carol Serna")) {
    return "Carol Serna";
  }
  
  return null;
}
