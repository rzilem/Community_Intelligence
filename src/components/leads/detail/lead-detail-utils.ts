
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
 * Extracts ZIP code from either dedicated ZIP field or address string
 */
export function extractZipCode(lead: Lead): string {
  // First check if ZIP is directly available
  if (lead.zip) {
    return lead.zip;
  }
  
  // Try to extract from street address
  if (lead.street_address) {
    const zipPattern = /\b\d{5}\b/;
    const zipMatch = lead.street_address.match(zipPattern);
    if (zipMatch) {
      return zipMatch[0];
    }
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
 * Prioritizes full name if available, otherwise combines first and last name
 */
export function formatLeadName(lead: Lead): string {
  // If full name exists, use it
  if (lead.name) return lead.name;
  
  // If no full name, construct from first and last name
  const firstName = lead.first_name || '';
  const lastName = lead.last_name || '';
  
  return (firstName + ' ' + lastName).trim() || 'N/A';
}
