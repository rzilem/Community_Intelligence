
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

// Helper function to extract name from header format like "Name <email@domain.com>"
export function extractNameFromHeader(header: string): string {
  if (!header) return "";
  
  // Try to extract name from "Name <email>" format
  const nameMatch = header.match(/^([^<]+)</);
  if (nameMatch && nameMatch[1]) {
    return nameMatch[1].trim();
  }
  
  // If that fails, try to extract from "email (Name)" format
  const parenthesesMatch = header.match(/\(([^)]+)\)/);
  if (parenthesesMatch && parenthesesMatch[1]) {
    return parenthesesMatch[1].trim();
  }
  
  // If we really can't find a name, return empty string
  return "";
}

// Helper function to validate email format
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  // More comprehensive email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
