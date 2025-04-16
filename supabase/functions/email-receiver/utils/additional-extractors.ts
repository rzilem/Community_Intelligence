/**
 * Extracts additional information from email content
 */
export function extractAdditionalInfo(content: string) {
  const result: { notes?: string } = {};

  // Store the entire HTML content to keep all additional information
  if (content) {
    result.notes = content;
  }

  return result;
}

/**
 * Extract phone numbers from content
 */
export function extractPhoneNumbers(content: string) {
  // Match various phone number formats
  const phoneRegex = /(?:\+?1[-.\s]?)?(?:\(?([0-9]{3})\)?[-.\s]?)?([0-9]{3})[-.\s]?([0-9]{4})/g;
  
  const phones: string[] = [];
  let match;
  
  while ((match = phoneRegex.exec(content)) !== null) {
    // Format phone number consistently
    const fullMatch = match[0];
    // Only add if it looks like a complete phone number
    if (fullMatch.replace(/[^0-9]/g, '').length >= 10) {
      phones.push(fullMatch.trim());
    }
  }
  
  return phones;
}
