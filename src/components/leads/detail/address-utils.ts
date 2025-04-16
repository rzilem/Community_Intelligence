
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
 * Formats a complete address with proper spacing and punctuation
 * @param streetAddress The street address line
 * @param city The city name
 * @param state The state code (e.g., TX)
 * @param zipCode The ZIP code
 * @returns A properly formatted complete address
 */
export function formatFullAddress(
  streetAddress?: string, 
  city?: string, 
  state?: string, 
  zipCode?: string
): string {
  if (!streetAddress) return 'N/A';
  
  const formattedStreet = formatStreetAddress(streetAddress);
  const formattedCity = city ? cleanCityName(city) : '';
  
  const cityStateZip = [
    formattedCity,
    state,
    zipCode
  ]
    .filter(Boolean)
    .join(', ')
    .replace(/, ([A-Z]{2}),/, ', $1 '); // Fix state/zip formatting: "TX, 12345" -> "TX 12345"
  
  return cityStateZip ? `${formattedStreet}, ${cityStateZip}` : formattedStreet;
}

/**
 * Creates a Google Maps link from an address string
 * @param address The address to link to on Google Maps
 * @returns A properly formatted Google Maps URL
 */
export function createGoogleMapsLink(address: string | undefined): string {
  if (!address) return '#';
  
  // Clean up the address by removing "Map It" and similar phrases
  const cleanAddress = address.replace(/Map\s*It/gi, '').trim();
  
  // URL encode the address for Google Maps
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddress)}`;
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
    zipCode,
    fullAddress: formatFullAddress(formattedStreetAddress, cleanedCity, lead.state, zipCode)
  };
}
