
/**
 * Extract contact information from email content
 */
import { extractEmailFromHeader, isValidEmail } from "../../utils/email-helpers.ts";
import { extractNameFromContent } from "../../utils/name-extractors.ts";

export function extractContactInformation(content: string, fromHeader: string) {
  console.log("Extracting contact information");
  const lead: Record<string, any> = {};
  
  try {
    // Extract email from the From header - this is the most reliable source
    if (fromHeader) {
      const senderEmail = extractEmailFromHeader(fromHeader);
      if (isValidEmail(senderEmail)) {
        lead.email = senderEmail;
        console.log("Extracted email from From header:", senderEmail);
      }
    }
    
    // If no email was found in the header, try to find it in the content
    if (!lead.email) {
      const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
      const emailMatches = content.match(emailRegex);
      if (emailMatches && emailMatches.length > 0) {
        // Use the first email found in the content
        lead.email = emailMatches[0];
        console.log("Extracted email from content:", lead.email);
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
    
    // If we still don't have a name, try to extract it from the email
    if (!lead.name && lead.email) {
      const emailParts = lead.email.split('@')[0].split(/[._-]/);
      if (emailParts.length >= 2) {
        lead.first_name = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
        lead.last_name = emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1);
        lead.name = `${lead.first_name} ${lead.last_name}`;
        console.log("Name extracted from email:", lead.name);
      }
    }
    
    // Check for phone number in content
    const phoneRegex = /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\(\d{3}\)\s*\d{3}[-.\s]?\d{4}|\d{10})/g;
    const phoneMatches = content.match(phoneRegex);
    if (phoneMatches && phoneMatches.length > 0) {
      lead.phone = phoneMatches[0].replace(/[^\d]/g, '');
      console.log("Phone extracted from content:", lead.phone);
    }
    
    console.log("Extracted contact information:", lead);
    return lead;
  } catch (error) {
    console.error("Error extracting contact information:", error);
    return lead; // Return what we have so far even if there was an error
  }
}
