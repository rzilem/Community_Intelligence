
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { 
  extractContactInformation,
  extractAssociationInformation,
  extractLocationInformation,
  extractAdditionalInformation
} from "./extractors/index.ts";
import { extractEmailFromHeader, isValidEmail } from "../utils/email-helpers.ts";

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
    
    console.log("From header:", from);
    
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
    
    // Debug the content being processed
    console.log("Processing content excerpt:", content.substring(0, 200));
    
    // Extract all information using specialized extractors
    const contactInfo = extractContactInformation(content, from);
    const associationInfo = extractAssociationInformation(content);
    const locationInfo = extractLocationInformation(content);
    const additionalInfo = extractAdditionalInformation(content);
    
    // Merge all extracted information into the lead object
    Object.assign(lead, contactInfo, associationInfo, locationInfo, additionalInfo);
    
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
    
    // Final fallback for name if not found
    if (!lead.name || lead.name.length < 2) {
      if (lead.association_name) {
        // Try using association name contact person
        lead.name = `Contact for ${lead.association_name}`;
        console.log("Using association name as fallback for contact name");
      } else if (lead.email && lead.email !== "no-email@example.com") {
        // Create a generic name instead of using email username
        lead.name = "Lead Contact";
        console.log("Using generic name as fallback");
      } else {
        lead.name = "Unknown Contact";
        console.log("Using 'Unknown Contact' as name fallback");
      }
    }
    
    // Make sure we have first_name and last_name fields
    if (!lead.first_name && !lead.last_name && lead.name && lead.name !== "Unknown Contact") {
      const nameParts = lead.name.split(' ');
      if (nameParts.length > 0) lead.first_name = nameParts[0];
      if (nameParts.length > 1) lead.last_name = nameParts.slice(1).join(' ');
    }
    
    // Add subject to notes
    if (subject) {
      lead.notes = `Subject: ${subject}`;
      
      if (content) {
        lead.notes += `\n\nContent: ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`;
      }
    }
    
    // Ensure we extract city from the address if not set
    if (!lead.city && lead.street_address) {
      // Use the location-extractors to get just the city
      const cityMatch = lead.street_address.match(/(?:,\s*|\s+)([A-Za-z\s.]+?)(?:,\s*|\s+)(?:[A-Z]{2}|[A-Za-z\s]+)\s+\d{5}/);
      if (cityMatch && cityMatch[1]) {
        lead.city = cityMatch[1].trim();
      }
    }
    
    console.log("Extracted lead data:", lead);
    return lead;
  } catch (error) {
    console.error("Error processing email:", error);
    throw new Error(`Failed to process email: ${error.message}`);
  }
}
