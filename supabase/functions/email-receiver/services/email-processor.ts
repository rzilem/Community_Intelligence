
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { 
  extractEmailFromHeader, 
  extractNameFromHeader,
  isValidEmail,
  extractAssociationInfo,
  extractContactInfo,
  extractCompanyInfo,
  extractAdditionalInfo
} from "../utils/email-helpers.ts";

export async function processEmail(emailData: any) {
  console.log("Processing email data");
  
  // Initialize lead with default values
  const lead: Record<string, any> = {
    source: 'Email',
    status: 'new',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  try {
    // Extract from, subject and raw content from the email
    const from = emailData.from || emailData.From || emailData.sender || emailData.Sender || "";
    const subject = emailData.subject || emailData.Subject || "";
    const rawHtmlContent = emailData.html || emailData.Html || emailData.body || emailData.Body || "";
    const rawTextContent = emailData.text || emailData.Text || emailData.plain || emailData.Plain || "";
    
    // Save the original HTML content
    lead.html_content = rawHtmlContent;
    
    // Parse HTML content
    let parsedText = rawTextContent;
    if (rawHtmlContent) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtmlContent, "text/html");
        if (doc && doc.body) {
          parsedText = doc.body.textContent || rawTextContent;
        }
      } catch (error) {
        console.error("Error parsing HTML:", error);
      }
    }
    
    // Extract content from HTML
    const content = parsedText || rawTextContent || subject;
    
    // Extract association information
    const associationInfo = extractAssociationInfo(content);
    if (associationInfo.name) lead.association_name = associationInfo.name;
    if (associationInfo.type) lead.association_type = associationInfo.type;
    if (associationInfo.units) lead.number_of_units = associationInfo.units;
    
    // Extract contact information
    const contactInfo = extractContactInfo(content, from);
    if (contactInfo.name) lead.name = contactInfo.name;
    if (contactInfo.email) lead.email = contactInfo.email;
    if (contactInfo.phone) lead.phone = contactInfo.phone;
    
    // If we have a full name, try to parse first and last name
    if (lead.name) {
      const nameParts = lead.name.split(' ');
      if (nameParts.length > 0) lead.first_name = nameParts[0];
      if (nameParts.length > 1) lead.last_name = nameParts.slice(1).join(' ');
    }
    
    // Extract company information
    const companyInfo = extractCompanyInfo(content, from);
    if (companyInfo.company) lead.company = companyInfo.company;
    
    // Extract additional information
    const additionalInfo = extractAdditionalInfo(content);
    if (additionalInfo.notes) lead.additional_requirements = additionalInfo.notes;
    if (additionalInfo.address) lead.street_address = additionalInfo.address;
    
    // Fallback for email if not found
    if (!lead.email && from) {
      const extractedEmail = extractEmailFromHeader(from);
      if (isValidEmail(extractedEmail)) {
        lead.email = extractedEmail;
      }
    }
    
    // Email is required
    if (!lead.email) {
      lead.email = "no-email@example.com";
      console.warn("No valid email found, using placeholder");
    }
    
    // Fallback for name if not found
    if (!lead.name) {
      if (from) {
        lead.name = extractNameFromHeader(from);
      }
      if (!lead.name && lead.email) {
        // Use email username as name fallback
        const emailUsername = lead.email.split('@')[0];
        lead.name = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
      }
    }
    
    // Notes fields
    if (!lead.notes) {
      lead.notes = `Email received with subject: ${subject}`;
      if (content) {
        lead.notes += `\n\nContent: ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`;
      }
    }
    
    // Add subject to notes
    if (subject) {
      lead.notes = lead.notes ? 
        `Subject: ${subject}\n\n${lead.notes}` : 
        `Subject: ${subject}`;
    }
    
    console.log("Extracted lead data:", lead);
    return lead;
  } catch (error) {
    console.error("Error processing email:", error);
    throw new Error(`Failed to process email: ${error.message}`);
  }
}
