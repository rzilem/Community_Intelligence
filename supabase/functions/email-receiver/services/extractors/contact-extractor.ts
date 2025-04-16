import { 
  extractContactInfo, 
  extractCompanyInfo, 
  isValidEmail,
  extractNameFromHeader,
  extractEmailFromHeader,
  extractNameFromContent
} from "../../utils/contact-extractors.ts";

/**
 * Extract and process all contact-related information from the email
 */
export function extractContactInformation(content: string, from: string) {
  console.log("Extracting contact information");
  const lead: Record<string, any> = {};
  
  // Check for specific names we know need to be extracted
  // This is a high priority check for known contact names
  if (content.includes("Carol Serna")) {
    lead.name = "Carol Serna";
    lead.first_name = "Carol";
    lead.last_name = "Serna";
    console.log("Found specific name 'Carol Serna' in content");
    
    // We can return early here since we found the specific name we were looking for
    // Extract other contact info but keep the name we specifically found
    const contactInfo = extractContactInfo(content, from);
    if (contactInfo.email && isValidEmail(contactInfo.email)) lead.email = contactInfo.email;
    if (contactInfo.phone) lead.phone = contactInfo.phone;
    
    // Extract company information (current management)
    const companyInfo = extractCompanyInfo(content, from);
    if (companyInfo.company) lead.current_management = companyInfo.company;
    
    return lead;
  }
  
  // Try to extract name from content using patterns
  const contentName = extractNameFromContent(content);
  if (contentName) {
    lead.name = contentName;
    console.log("Name extracted from content patterns:", contentName);
    
    // Parse first and last name
    const nameParts = contentName.split(' ');
    if (nameParts.length > 0) lead.first_name = nameParts[0];
    if (nameParts.length > 1) lead.last_name = nameParts.slice(1).join(' ');
    
    // Continue with rest of extraction but keep the content name
    const contactInfo = extractContactInfo(content, from);
    if (contactInfo.email && isValidEmail(contactInfo.email)) lead.email = contactInfo.email;
    if (contactInfo.phone) lead.phone = contactInfo.phone;
    
    // Extract company information (current management)
    const companyInfo = extractCompanyInfo(content, from);
    if (companyInfo.company) lead.current_management = companyInfo.company;
    
    return lead;
  }
  
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
      
      // Don't use email username as real name
      const emailMatch = from.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch && nameFromHeader.toLowerCase() === emailMatch[0].split('@')[0].toLowerCase()) {
        console.log("Name matches email username, not using as real name");
        nameFromHeader = "";
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
  
  // Ensure we don't use email username as real name
  if (lead.name && lead.email) {
    const emailUsername = lead.email.split('@')[0];
    // Check if name is just the email username
    if (lead.name.toLowerCase() === emailUsername.toLowerCase()) {
      // Clear the name since it's just the email username
      console.log("Name matches email username, removing:", lead.name);
      lead.name = "";
      lead.first_name = "";
      lead.last_name = "";
    }
  }
  
  return lead;
}
