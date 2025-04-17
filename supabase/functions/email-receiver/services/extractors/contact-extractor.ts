
/**
 * Extract contact information from email content
 */
import { extractEmailFromHeader, isValidEmail } from "../../utils/email-helpers.ts";
import { extractNameFromContent } from "../../utils/name-extractors.ts";

export function extractContactInformation(content: string, fromHeader: string) {
  console.log("Extracting contact information");
  const lead: Record<string, any> = {};
  
  try {
    // Extract email from the From header
    if (fromHeader) {
      const senderEmail = extractEmailFromHeader(fromHeader);
      if (isValidEmail(senderEmail)) {
        lead.email = senderEmail;
      }
    }
    
    // Extract name from content
    const nameInfo = extractNameFromContent(content);
    if (nameInfo) {
      lead.first_name = nameInfo.firstName;
      lead.last_name = nameInfo.lastName;
      lead.name = `${nameInfo.firstName} ${nameInfo.lastName}`.trim();
      console.log("Name extracted from content:", nameInfo);
    }
    
    // Check for phone number in content
    const phoneRegex = /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\(\d{3}\)\s*\d{3}[-.\s]?\d{4}|\d{10})/g;
    const phoneMatches = content.match(phoneRegex);
    if (phoneMatches && phoneMatches.length > 0) {
      lead.phone = phoneMatches[0].replace(/[^\d]/g, '');
    }
    
    return lead;
  } catch (error) {
    console.error("Error extracting contact information:", error);
    return lead; // Return what we have so far even if there was an error
  }
}
