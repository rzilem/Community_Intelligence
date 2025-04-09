
/**
 * Helper functions for extracting email information from headers and content
 */

// Helper function to extract email from header format like "Name <email@domain.com>"
export function extractEmailFromHeader(header: string): string {
  if (!header) return "";
  
  // Try to extract email from < > format first
  const emailMatch = header.match(/<([^>]+)>/);
  if (emailMatch && emailMatch[1]) {
    return emailMatch[1].trim();
  }
  
  // If no <email> format found, try to extract something that looks like an email
  const simpleEmailMatch = header.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (simpleEmailMatch) {
    return simpleEmailMatch[0];
  }
  
  // If all else fails, return the header as is (might not be an email)
  return header.trim();
}

// Helper function to validate email format
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  // More comprehensive email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
