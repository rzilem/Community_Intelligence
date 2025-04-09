
import { extractContactInfo, extractCompanyInfo } from "../../utils/contact-extractors.ts";
import { extractEmailFromHeader, extractNameFromHeader, isValidEmail } from "../../utils/email-helpers.ts";

/**
 * Extract and process all contact-related information from the email
 */
export function extractContactInformation(content: string, from: string) {
  console.log("Extracting contact information");
  const lead: Record<string, any> = {};
  
  // HIGHEST PRIORITY: Extract name directly from From field
  if (from) {
    let nameFromHeader = extractNameFromHeader(from);
    console.log("Initial name extracted from header:", nameFromHeader);
    
    // Clean up common patterns in extracted names
    if (nameFromHeader) {
      // Remove "of Association" pattern
      if (nameFromHeader.toLowerCase().includes("of association")) {
        nameFromHeader = nameFromHeader.replace(/\s*of\s*association\s*/i, "").trim();
      }
      
      // Check if we still have a valid name
      if (nameFromHeader && nameFromHeader.length > 1) {
        lead.name = nameFromHeader;
        console.log("Using cleaned name from header:", nameFromHeader);
        
        // Parse first and last name
        const nameParts = nameFromHeader.split(' ');
        if (nameParts.length > 0) lead.first_name = nameParts[0];
        if (nameParts.length > 1) lead.last_name = nameParts.slice(1).join(' ');
      }
    }
  }
  
  // MEDIUM PRIORITY: Look for explicit name patterns in content if no name from header
  if (!lead.name || lead.name.length < 2) {
    // Try to find explicit name patterns in the content
    const namePatterns = [
      /[Nn]ame:\s*([^,\n<]+)/,
      /[Ff]rom:\s*([^,\n<]+)/,
      /[Cc]ontact:\s*([^,\n<]+)/,
      /[Cc]ontact\s+[Nn]ame:\s*([^,\n<]+)/
    ];
    
    for (const pattern of namePatterns) {
      const match = content.match(pattern);
      if (match && match[1] && match[1].trim()) {
        const contentName = match[1].trim();
        // Skip if it's "of Association" or similar
        if (!contentName.toLowerCase().includes("of association") && contentName.length > 1) {
          lead.name = contentName;
          console.log("Name found in content pattern:", contentName);
          
          // Parse first and last name
          const nameParts = contentName.split(' ');
          if (nameParts.length > 0) lead.first_name = nameParts[0];
          if (nameParts.length > 1) lead.last_name = nameParts.slice(1).join(' ');
          break;
        }
      }
    }
  }
  
  // Extract contact information from content
  const contactInfo = extractContactInfo(content, from);
  console.log("Contact info extracted:", contactInfo);
  
  // LOW PRIORITY: If still no name, use name from contact info
  if ((!lead.name || lead.name.length < 2) && contactInfo.name) {
    const contactName = contactInfo.name;
    if (!contactName.toLowerCase().includes("of association") && contactName.length > 1) {
      lead.name = contactName;
      console.log("Using name from contact info:", contactName);
      
      // Parse first and last name
      const nameParts = contactName.split(' ');
      if (nameParts.length > 0) lead.first_name = nameParts[0];
      if (nameParts.length > 1) lead.last_name = nameParts.slice(1).join(' ');
    }
  }
  
  // Set other contact info
  if (contactInfo.email && isValidEmail(contactInfo.email)) lead.email = contactInfo.email;
  if (contactInfo.phone) lead.phone = contactInfo.phone;
  
  // Extract company information (current management)
  const companyInfo = extractCompanyInfo(content, from);
  console.log("Company info extracted:", companyInfo);
  
  if (companyInfo.company) lead.current_management = companyInfo.company;
  
  return lead;
}
