
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
  
  // Look for association type - prioritize this pattern first
  const condoPatterns = [
    /Condo Association/i,
    /I am requesting a proposal for a\s*([\w\s]+)/i,
  ];
  
  for (const pattern of condoPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.type = match[1].trim();
      break;
    } else if (match && content.includes("Condo")) {
      result.type = "Condo";
      break;
    }
  }
  
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
  
  // If type still not found, try general association type patterns
  if (!result.type) {
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
  }
  
  // Look for number of units patterns
  const unitsPatterns = [
    /Number of Homes or Units[:\s]*([0-9,]+)/i,
    /Units[:\s]*([0-9,]+)/i,
    /Homes[:\s]*([0-9,]+)/i,
    /Properties[:\s]*([0-9,]+)/i,
    /Total Units[:\s]*([0-9,]+)/i
  ];
  
  for (const pattern of unitsPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      // Remove commas from numbers like "1,525"
      const cleanNumber = match[1].replace(/,/g, '');
      const units = parseInt(cleanNumber, 10);
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
  
  // First try to extract name from the content - specific pattern for "Name" field
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

// Helper function to extract additional information
export function extractAdditionalInfo(content: string): { notes?: string, address?: string, city?: string, state?: string, zip?: string } {
  const result: { notes?: string, address?: string, city?: string, state?: string, zip?: string } = {};
  
  // Extract address with improved pattern detection
  const addressPatterns = [
    /Property Address[:\s]*([^<>\n\r]+)/i,
    /Address[:\s]*([^<>\n\r]+)/i,
    /Location[:\s]*([^<>\n\r]+)/i
  ];
  
  for (const pattern of addressPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.address = match[1].trim();
      break;
    }
  }
  
  // Extract city with improved pattern
  // Look for city, state, zip pattern like "Austin, TX 78724"
  const cityStateZipPattern = /([A-Za-z\s]+),\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)/i;
  const cityStateZipMatch = content.match(cityStateZipPattern);
  
  if (cityStateZipMatch) {
    result.city = cityStateZipMatch[1].trim();
    result.state = cityStateZipMatch[2].trim();
    result.zip = cityStateZipMatch[3].trim();
  } else {
    // Try to match individual components if the full pattern doesn't match
    const cityPatterns = [
      /City[:\s]*([^<>\n\r,.]+)/i,
      /Location[:\s].*?City[:\s]*([^<>\n\r,.]+)/i
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
      /,\s*([A-Z]{2})\s*\d{5}/i // Match state in "City, ST 12345" format
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
      /ZIP[:\s]*(\d{5}(?:-\d{4})?)/i,
      /Postal Code[:\s]*(\d{5}(?:-\d{4})?)/i,
      /Zip Code[:\s]*(\d{5}(?:-\d{4})?)/i,
      /[A-Z]{2}\s*(\d{5}(?:-\d{4})?)/i // Match ZIP in "ST 12345" format
    ];
    
    for (const pattern of zipPatterns) {
      const match = content.match(pattern);
      if (match && match[1] && match[1].trim()) {
        result.zip = match[1].trim();
        break;
      }
    }
  }
  
  // Extract additional information/notes
  const notesPatterns = [
    /Additional Information[:\s]*([^<>\n\r]+)/i,
    /Additional Information or requirements[:\s]*([^<>\n\r]+)/i,
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
