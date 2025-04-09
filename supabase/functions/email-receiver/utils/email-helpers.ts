
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

// Helper function to extract association information from email content
export function extractAssociationInfo(content: string): { name?: string, type?: string, units?: number } {
  const result: { name?: string, type?: string, units?: number } = {};
  
  // Look for association name patterns
  const namePatterns = [
    /Name of Association[:\s]*([^<>\n\r]+)/i,
    /Association Name[:\s]*([^<>\n\r]+)/i,
    /HOA Name[:\s]*([^<>\n\r]+)/i,
    /Community Name[:\s]*([^<>\n\r]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.name = match[1].trim();
      break;
    }
  }
  
  // Look for association type patterns - improved to be more specific
  const typePatterns = [
    /Association Type[:\s]*([^<>\n\r,.]+)/i,
    /Type of Association[:\s]*([^<>\n\r,.]+)/i,
    /Type[:\s]*(HOA|Condo|Condominium|Townhome|Single-Family)/i,
    /The property is a[:\s]*(HOA|Condo|Condominium|Townhome|Single-Family)/i,
    /It is a[:\s]*(HOA|Condo|Condominium|Townhome|Single-Family)/i
  ];
  
  for (const pattern of typePatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.type = match[1].trim();
      break;
    }
  }
  
  // Look for number of units patterns
  const unitsPatterns = [
    /Number of Homes or Units[:\s]*(\d+)/i,
    /Units[:\s]*(\d+)/i,
    /Homes[:\s]*(\d+)/i,
    /Properties[:\s]*(\d+)/i,
    /Total Units[:\s]*(\d+)/i
  ];
  
  for (const pattern of unitsPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const units = parseInt(match[1], 10);
      if (!isNaN(units)) {
        result.units = units;
        break;
      }
    }
  }
  
  return result;
}

// Helper function to extract contact information from email content
export function extractContactInfo(content: string, from: string = ""): { name?: string, email?: string, phone?: string } {
  const result: { name?: string, email?: string, phone?: string } = {};
  
  // First try to extract name from the content
  const namePatterns = [
    /Name[:\s]*([^<>\n\r]+)/i,
    /Contact[:\s]*([^<>\n\r]+)/i,
    /Contact Person[:\s]*([^<>\n\r]+)/i
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
    result.name = extractNameFromHeader(from);
  }
  
  // Extract email from content
  const emailPatterns = [
    /Email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    /Contact Email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
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
      result.phone = match[1].trim().replace(/\s+/g, ' ');
      break;
    }
  }
  
  return result;
}

// Helper function to extract company information
export function extractCompanyInfo(content: string, from: string = ""): { company?: string } {
  const result: { company?: string } = {};
  
  // First try to extract company from content
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
  
  // If no company found, try to extract from association name or email domain
  if (!result.company) {
    // Try to extract from 'from' field domain
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
    
    // If still no company, try to use association name
    if (!result.company) {
      const associationInfo = extractAssociationInfo(content);
      if (associationInfo.name) {
        result.company = associationInfo.name;
      }
    }
  }
  
  return result;
}

// Helper function to extract additional information
export function extractAdditionalInfo(content: string): { notes?: string, address?: string, city?: string, state?: string, zip?: string } {
  const result: { notes?: string, address?: string, city?: string, state?: string, zip?: string } = {};
  
  // Extract address
  const addressPatterns = [
    /Address[:\s]*([^<>\n\r]+)/i,
    /Property Address[:\s]*([^<>\n\r]+)/i,
    /Location[:\s]*([^<>\n\r]+)/i
  ];
  
  for (const pattern of addressPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.address = match[1].trim();
      break;
    }
  }
  
  // Extract city
  const cityPatterns = [
    /City[:\s]*([^<>\n\r,.]+)/i,
    /Location[:\s].*?City[:\s]*([^<>\n\r,.]+)/i,
    /In ([A-Za-z\s]+),\s*[A-Z]{2}/i, // Match "In Boulder, CO" pattern
  ];
  
  for (const pattern of cityPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.city = match[1].trim();
      break;
    }
  }
  
  // Extract state
  const statePatterns = [
    /State[:\s]*([^<>\n\r,.]+)/i,
    /Location[:\s].*?State[:\s]*([^<>\n\r,.]+)/i,
    /in\s+[A-Za-z\s]+,\s*([A-Z]{2})/i, // Match "in Boulder, CO" pattern
  ];
  
  for (const pattern of statePatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.state = match[1].trim();
      break;
    }
  }
  
  // Extract ZIP code
  const zipPatterns = [
    /ZIP[:\s]*(\d{5}(-\d{4})?)/i,
    /Postal Code[:\s]*(\d{5}(-\d{4})?)/i,
    /Zip Code[:\s]*(\d{5}(-\d{4})?)/i
  ];
  
  for (const pattern of zipPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.zip = match[1].trim();
      break;
    }
  }
  
  // Extract additional information/notes
  const notesPatterns = [
    /Additional Information[:\s]*([^<>\n\r]+)/i,
    /Notes[:\s]*([^<>\n\r]+)/i,
    /Comments[:\s]*([^<>\n\r]+)/i,
    /Requirements[:\s]*([^<>\n\r]+)/i,
    /Additional Requirements[:\s]*([^<>\n\r]+)/i
  ];
  
  for (const pattern of notesPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.notes = match[1].trim();
      break;
    }
  }
  
  return result;
}
