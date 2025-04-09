
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { 
  extractEmailFromHeader, 
  extractNameFromHeader,
  isValidEmail,
  extractAssociationInfo,
  extractContactInfo,
  extractCompanyInfo,
  extractLocationInfo,
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
    
    // Extract content from HTML or fallback to text content or subject
    const content = parsedText || rawTextContent || subject;
    console.log("Extracted content:", content);
    
    // HIGHER PRIORITY: Try to extract name from 'from' field first
    if (from) {
      const nameFromHeader = extractNameFromHeader(from);
      if (nameFromHeader) {
        lead.name = nameFromHeader;
        console.log("Name extracted from From header:", nameFromHeader);
        
        // If we have a full name, try to parse first and last name
        const nameParts = nameFromHeader.split(' ');
        if (nameParts.length > 0) lead.first_name = nameParts[0];
        if (nameParts.length > 1) lead.last_name = nameParts.slice(1).join(' ');
      }
    }
    
    // Extract contact information from content (name, email, phone)
    const contactInfo = extractContactInfo(content, from);
    console.log("Contact info extracted:", contactInfo);
    
    // LOWER PRIORITY: If no name found in header, try using the one from content
    if (!lead.name && contactInfo.name) {
      lead.name = contactInfo.name;
      
      // If we have a full name, try to parse first and last name
      const nameParts = contactInfo.name.split(' ');
      if (nameParts.length > 0) lead.first_name = nameParts[0];
      if (nameParts.length > 1) lead.last_name = nameParts.slice(1).join(' ');
    }
    
    // Set other contact info
    if (contactInfo.email) lead.email = contactInfo.email;
    if (contactInfo.phone) lead.phone = contactInfo.phone;
    
    // Extract association information
    const associationInfo = extractAssociationInfo(content);
    console.log("Association info extracted:", associationInfo);
    
    if (associationInfo.name) lead.association_name = associationInfo.name;
    if (associationInfo.type) lead.association_type = associationInfo.type;
    if (associationInfo.units) lead.number_of_units = associationInfo.units;
    
    // Extract company information (current management)
    const companyInfo = extractCompanyInfo(content, from);
    console.log("Company info extracted:", companyInfo);
    
    if (companyInfo.company) lead.current_management = companyInfo.company;
    
    // Extract location information (address, city, state, zip)
    const locationInfo = extractLocationInfo(content);
    console.log("Location info extracted:", locationInfo);
    
    if (locationInfo.address) lead.street_address = locationInfo.address;
    if (locationInfo.city) lead.city = locationInfo.city;
    if (locationInfo.state) lead.state = locationInfo.state;
    if (locationInfo.zip) lead.zip = locationInfo.zip;
    
    // Extract additional information/notes
    const additionalInfo = extractAdditionalInfo(content);
    console.log("Additional info extracted:", additionalInfo);
    
    if (additionalInfo.notes) lead.additional_requirements = additionalInfo.notes;
    
    // Fallbacks for required fields
    
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
      if (lead.email) {
        // Use email username as name fallback
        const emailUsername = lead.email.split('@')[0];
        lead.name = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
      }
    }
    
    // Add subject to notes
    if (subject) {
      lead.notes = `Subject: ${subject}`;
      
      if (content) {
        lead.notes += `\n\nContent: ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`;
      }
    }
    
    console.log("Extracted lead data:", lead);
    return lead;
  } catch (error) {
    console.error("Error processing email:", error);
    throw new Error(`Failed to process email: ${error.message}`);
  }
}
