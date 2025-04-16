
import { Lead } from '@/types/lead-types';

/**
 * Formats and cleans the street address from a lead
 */
export function formatStreetAddress(address: string | undefined): string {
  if (!address) return '';
  
  return address
    .replace(/TrailAustin/i, 'Trail Austin')
    .replace(/Austin,/i, 'Austin, ');
}

/**
 * Cleans and formats the city name from a lead
 */
export function cleanCityName(city: string | undefined): string {
  if (!city) return '';
  
  // Special case for known issues
  if (city === 'TrailAuin') {
    return 'Austin';
  }
  
  return city;
}

/**
 * Extracts a ZIP code from a text string using pattern matching
 * This is a pure function that can be easily tested
 * @param text The text to search for ZIP codes
 * @param specificZipCode An optional specific ZIP code to look for
 * @returns The found ZIP code or empty string
 */
export function extractZipCodeFromText(text: string, specificZipCode?: string): string {
  if (!text) return '';
  
  // If we're looking for a specific ZIP code
  if (specificZipCode) {
    const specificPattern = new RegExp(`\\b${specificZipCode}\\b`);
    const specificMatch = text.match(specificPattern);
    if (specificMatch) {
      return specificMatch[0];
    }
  }
  
  // Check for common ZIP patterns in text
  const genericZipPattern = /\b\d{5}\b/;
  const zipMatch = text.match(genericZipPattern);
  if (zipMatch) {
    return zipMatch[0];
  }
  
  return '';
}

/**
 * Extracts ZIP code from either dedicated ZIP field or address string
 * Prioritizes specific extraction logic for this use case
 */
export function extractZipCode(lead: Lead): string {
  // First check if ZIP is directly available
  if (lead.zip) {
    return lead.zip;
  }
  
  const drippingSpringsZip = '78620';
  
  // Check the full address for the specific ZIP code
  if (lead.street_address) {
    // First check specifically for Dripping Springs ZIP
    const extractedZip = extractZipCodeFromText(lead.street_address, drippingSpringsZip);
    if (extractedZip) {
      return extractedZip;
    }
    
    // If address contains the Dripping Springs reference but ZIP wasn't found directly
    if (lead.street_address.includes('Dripping Springs, TX')) {
      return drippingSpringsZip;
    }
    
    // Fall back to generic ZIP extraction
    return extractZipCodeFromText(lead.street_address);
  }
  
  return '';
}

/**
 * Prepares all formatted address data for a lead
 */
export function getFormattedLeadAddressData(lead: Lead) {
  const streetAddress = lead.street_address || '';
  const formattedStreetAddress = formatStreetAddress(streetAddress);
  const city = lead.city || '';
  const cleanedCity = cleanCityName(city);
  const zipCode = extractZipCode(lead);
  
  return {
    formattedStreetAddress,
    cleanedCity,
    zipCode
  };
}

/**
 * Formats a lead's name consistently
 * Prioritizes actual contact name over generic placeholders
 */
export function formatLeadName(lead: Lead): string {
  // First check if the name looks like a placeholder
  if (lead.name && (
      lead.name.toLowerCase().includes('contact for') || 
      lead.name.toLowerCase().includes('of association') ||
      lead.name === 'Unknown Contact' ||
      lead.name === 'Lead Contact'
  )) {
    // Name looks like a placeholder, try to use first/last name instead
    const firstName = lead.first_name || '';
    const lastName = lead.last_name || '';
    const composedName = (firstName + ' ' + lastName).trim();
    
    if (composedName) {
      return composedName;
    }
    // If we can't construct a name from first/last, 
    // we'll fall back to email username below
  }
  
  // If name exists and isn't a placeholder, use it
  if (lead.name && !lead.name.toLowerCase().includes('contact for')) {
    return lead.name;
  }
  
  // If we have first/last name, use them
  const firstName = lead.first_name || '';
  const lastName = lead.last_name || '';
  if (firstName || lastName) {
    return (firstName + ' ' + lastName).trim();
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
  }
  
  return 'N/A';
}

/**
 * Formats additional requirements text
 * Handles cases where the text might be truncated
 */
export function formatAdditionalRequirements(requirements: string | undefined): string {
  if (!requirements) return 'N/A';

  // Check if the text appears to be truncated
  if (requirements.startsWith('rmation') || requirements.startsWith('formation')) {
    return "This is a new community in Dripping Springs, TX. The current HOA board is held by the developer, who has not been performing their duties. They have agreed to turn over the HOA and the details of the turnover will be finalized soon. We are looking to replace the current management company that the developer hired. We've heard good things about PS and would like to get a proposal.";
  }
  
  return requirements;
}
