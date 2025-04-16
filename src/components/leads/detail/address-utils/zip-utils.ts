
import { Lead } from '@/types/lead-types';

/**
 * Extracts ZIP code from text using pattern matching
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
