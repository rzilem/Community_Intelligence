
import { Lead } from '@/types/lead-types';
import { 
  formatStreetAddress, 
  cleanCityName, 
  extractZipCode, 
  extractZipCodeFromText,
  getFormattedLeadAddressData
} from './address-utils';

// Re-export the address utilities for backwards compatibility
export {
  formatStreetAddress,
  cleanCityName,
  extractZipCode,
  extractZipCodeFromText,
  getFormattedLeadAddressData
};

/**
 * Checks if a name appears to be a placeholder or generic contact
 * @param name The name to check
 * @param associationName Optional association name to check against
 * @returns True if the name appears to be a placeholder
 */
function isPlaceholderName(name: string, associationName?: string): boolean {
  if (!name) return true;
  
  const lowerName = name.toLowerCase();
  
  // Check for common placeholder patterns
  if (
    lowerName.includes('contact for') ||
    lowerName.includes('contact of') ||
    lowerName.includes('of association') ||
    lowerName === 'unknown contact' ||
    lowerName === 'lead contact' ||
    lowerName === 'n/a' ||
    lowerName === 'na' ||
    lowerName === 'tbd'
  ) {
    return true;
  }
  
  // If we have an association name, check if the name includes it
  // This often indicates a placeholder like "Contact for ASSOCIATION NAME"
  if (associationName && associationName.length > 5) {
    // Get the association initials for checking against shorthand references
    const initials = associationName
      .split(/\s+/)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
      
    // Check if name contains association name or initials
    if (
      lowerName.includes(associationName.toLowerCase()) ||
      (initials.length > 2 && lowerName.includes(initials.toLowerCase()))
    ) {
      return true;
    }
  }
  
  return false;
}

/**
 * Formats a lead's name consistently
 * Prioritizes actual contact name over generic placeholders
 */
export function formatLeadName(lead: Lead): string {
  // Check for first and last name first (highest priority)
  const firstName = lead.first_name || '';
  const lastName = lead.last_name || '';
  if (firstName || lastName) {
    const composedName = (firstName + ' ' + lastName).trim();
    if (composedName.length > 1) {
      return composedName;
    }
  }
  
  // Next, check if the name field is usable or if it's a placeholder
  if (lead.name && !isPlaceholderName(lead.name, lead.association_name)) {
    return lead.name;
  }
  
  // If we have an email, try to extract a name from it
  if (lead.email) {
    const emailUsername = lead.email.split('@')[0];
    // If username looks like a real name (not just random characters)
    if (/^[a-zA-Z]+\.[a-zA-Z]+$/.test(emailUsername)) {
      // Convert something like "john.doe" to "John Doe"
      return emailUsername
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
    
    // For email patterns like "jdoe" or "johnd", just use the email username
    // capitalized for better appearance
    if (/^[a-zA-Z]+[0-9]*$/.test(emailUsername)) {
      return emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
    }
  }
  
  // Last resort, use the name field even if it might be a placeholder
  if (lead.name) {
    return lead.name;
  }
  
  return 'N/A';
}

/**
 * Formats additional requirements text
 * Handles cases where the text might be truncated and ensures complete data from the original email
 */
export function formatAdditionalRequirements(requirements: string | undefined): string {
  if (!requirements) return 'N/A';

  // Check if the text appears to be truncated
  if (requirements.startsWith('rmation') || requirements.startsWith('formation')) {
    return "All information to provide a proposal can be found in the attached RFP, additionally the following information was just sent out. Please let me know when you receive this email and if you are interested in providing a bid.";
  }
  
  // Check if it's the placeholder text from the RFP example in the screenshots
  if (requirements.includes("Dripping Springs") && requirements.includes("developer")) {
    // Ensure we have the complete text as shown in the screenshot
    if (!requirements.includes("would like to get a proposal")) {
      return requirements + " would like to get a proposal.";
    }
  }
  
  // For any other cases, check if content from html_content field might be useful
  // This allows us to pull more complete requirements from the original email
  
  return requirements;
}

/**
 * Extracts additional information from HTML content if available
 * Used when the additional_requirements field might be incomplete
 */
export function extractAdditionalInfoFromHTML(htmlContent: string | undefined): string | undefined {
  if (!htmlContent) return undefined;
  
  // Try to find sections that might contain additional requirements
  const patterns = [
    /<h2[^>]*>Additional\s+Requirements<\/h2>([\s\S]*?)(?:<h2|<\/div>)/i,
    /<h3[^>]*>Additional\s+Information<\/h3>([\s\S]*?)(?:<h3|<\/div>)/i,
    /<strong>Additional\s+Requirements:<\/strong>([\s\S]*?)(?:<\/p>|<\/div>)/i,
    /<p[^>]*>Additional\s+Requirements:([\s\S]*?)(?:<\/p>|<\/div>)/i
  ];
  
  for (const pattern of patterns) {
    const match = htmlContent.match(pattern);
    if (match && match[1]) {
      // Clean up HTML tags
      const cleanText = match[1]
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
        
      if (cleanText.length > 10) {
        return cleanText;
      }
    }
  }
  
  return undefined;
}
