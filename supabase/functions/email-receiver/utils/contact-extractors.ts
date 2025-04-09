
/**
 * Helper functions for extracting contact information from email headers and content
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

// Helper function to extract contact information from email content
export function extractContactInfo(content: string, from: string = ""): { name?: string, email?: string, phone?: string } {
  const result: { name?: string, email?: string, phone?: string } = {};
  
  // First try to extract name from the content - specific pattern for "Name" field
  const namePatterns = [
    /Contact\s*Name[:\s]*([^<>\n\r,\.]+)/i,
    /Name[:\s]*([^<>\n\r,\.]+)/i,
    /From[:\s]*([^<>\n\r,\.]+)/i,
    /Contact[:\s]*([^<>\n\r,\.]+)/i,
    /Contact Person[:\s]*([^<>\n\r,\.]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.name = match[1].trim();
      break;
    }
  }
  
  // If no name found in content, try to extract from 'from' field
  if (!result.name && from) {
    const nameFromHeader = extractNameFromHeader(from);
    if (nameFromHeader) {
      result.name = nameFromHeader;
    }
  }
  
  // Extract email from content
  const emailPatterns = [
    /Email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    /Contact Email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    /[^a-zA-Z0-9]([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})[^a-zA-Z0-9]/i
  ];
  
  for (const pattern of emailPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && isValidEmail(match[1])) {
      result.email = match[1].trim();
      break;
    }
  }
  
  // If no email found in content, try to extract from 'from' field
  if (!result.email && from) {
    const extractedEmail = extractEmailFromHeader(from);
    if (isValidEmail(extractedEmail)) {
      result.email = extractedEmail;
    }
  }
  
  // Extract phone from content
  const phonePatterns = [
    /Phone[:\s]*([\d\s\(\)\-\+\.]+)/i,
    /Contact Phone[:\s]*([\d\s\(\)\-\+\.]+)/i,
    /Tel[:\s]*([\d\s\(\)\-\+\.]+)/i,
    /Telephone[:\s]*([\d\s\(\)\-\+\.]+)/i
  ];
  
  for (const pattern of phonePatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      // Clean up the phone number
      result.phone = match[1].trim().replace(/\s+/g, '');
      break;
    }
  }
  
  return result;
}

// Helper function to extract company information
export function extractCompanyInfo(content: string, from: string = ""): { company?: string } {
  const result: { company?: string } = {};
  
  // Look for "currently using" or similar patterns
  const currentlyUsingPatterns = [
    /We are currently[\.:\s]*([^<>\n\r]+)/i,
    /Currently managed by[\.:\s]*([^<>\n\r]+)/i,
    /Current Management[\.:\s]*([^<>\n\r]+)/i
  ];
  
  for (const pattern of currentlyUsingPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.company = match[1].trim();
      return result;
    }
  }
  
  // If not found, try other company patterns
  const companyPatterns = [
    /Company[:\s]*([^<>\n\r]+)/i,
    /Organization[:\s]*([^<>\n\r]+)/i,
    /Business[:\s]*([^<>\n\r]+)/i
  ];
  
  for (const pattern of companyPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.company = match[1].trim();
      break;
    }
  }
  
  // If no company found, try to extract from 'from' field domain
  if (!result.company) {
    if (from) {
      const email = extractEmailFromHeader(from);
      if (email) {
        const domainMatch = email.match(/@([^.]+)/);
        if (domainMatch && domainMatch[1] && domainMatch[1] !== 'gmail' && 
            domainMatch[1] !== 'yahoo' && domainMatch[1] !== 'hotmail' && 
            domainMatch[1] !== 'outlook' && domainMatch[1] !== 'aol') {
          result.company = domainMatch[1].charAt(0).toUpperCase() + domainMatch[1].slice(1);
        }
      }
    }
  }
  
  return result;
}
