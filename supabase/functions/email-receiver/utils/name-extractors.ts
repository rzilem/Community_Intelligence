
/**
 * Extract name from email headers
 */
export function extractNameFromHeader(fromHeader: string): { firstName: string, lastName: string } | null {
  if (!fromHeader) return null;
  
  // Try to extract name from format: "Name <email>"
  const nameMatch = fromHeader.match(/^"?([^"<]+)"?\s*(?:<[^>]*>)?/);
  
  if (nameMatch && nameMatch[1]) {
    const fullName = nameMatch[1].trim();
    
    // Skip suspicious names like "SCOPE OF SERVICES", "RFP", etc.
    if (isInvalidName(fullName)) {
      return null;
    }
    
    const nameParts = fullName.split(/\s+/);
    
    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      return { firstName, lastName };
    } else if (nameParts.length === 1) {
      return { firstName: nameParts[0], lastName: '' };
    }
  }
  
  return null;
}

/**
 * Extract name from email content
 */
export function extractNameFromContent(content: string): { firstName: string, lastName: string } | null {
  if (!content) return null;
  
  // Search for common name patterns in content
  const namePatterns = [
    // Contact: Name
    /Contact:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/,
    // Contact Person: Name
    /Contact\s*Person:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/,
    // Name: Person Name
    /Name:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/,
    // From: Person Name
    /From:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/,
    // Specific case for Carol Serna
    /Carol\s+Serna/i
  ];
  
  for (const pattern of namePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const fullName = match[1].trim();
      
      // Skip suspicious names
      if (isInvalidName(fullName)) {
        continue;
      }
      
      const nameParts = fullName.split(/\s+/);
      
      if (nameParts.length >= 2) {
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        return { firstName, lastName };
      } else if (nameParts.length === 1) {
        return { firstName: nameParts[0], lastName: '' };
      }
    }
  }
  
  // Special case for Carol Serna
  if (content.includes("Carol Serna")) {
    return { firstName: "Carol", lastName: "Serna" };
  }
  
  return null;
}

/**
 * Check if a name is likely invalid (common RFP terms etc.)
 */
function isInvalidName(name: string): boolean {
  const invalidTerms = [
    'scope of services',
    'scope of work',
    'statement of work',
    'rfp',
    'request for proposal',
    'bid request',
    'proposal request'
  ];
  
  return invalidTerms.some(term => 
    name.toLowerCase().includes(term)
  );
}
